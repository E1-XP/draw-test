import { connect, Socket } from "socket.io-client";

import {
  store,
  Message,
  DrawingPoint,
  broadcastedDrawingPoints
} from "./../store";
import * as actions from "./../actions";

interface InitData {
  messages: Message[];
  drawingPoints: DrawingPoint[];
  broadcastedDrawingPoints: broadcastedDrawingPoints;
}

export const socketService = new class SocketService {
  private socket: SocketIOClient.Socket | undefined;

  private API_URL = "http://localhost:3001";

  start = () => {
    const state = store.getState();

    this.socket = connect(
      this.API_URL,
      { query: `user=${state.user.username}` }
    );

    this.socket.on("connect", this.handleConnect);
  };

  closeSocket = () => {
    if (!this.socket) return;

    this.socket.close();
    store.dispatch(actions.setIsSocketConnected(false));
  };

  get = () => {
    if (!this.socket) throw new Error("socket is undefined");
    return this.socket;
  };

  private subscribeToEvents = () => {
    if (!this.socket) throw new Error("Socket is not connected!");

    this.socket.on("disconnect", this.handleDisconnect);

    this.socket.on("init", this.handleInitialData);

    this.socket.on("message", this.handleMessage);

    this.socket.on("draw", this.handleDrawingBroadcast);

    this.socket.on("drawgroupcorrection", this.handleDrawGroupCorrection);

    this.socket.on("drawgroupcorrectiontest", this.handleDrawGroupValidation);
  };

  private handleConnect = () => {
    this.subscribeToEvents();

    store.dispatch(actions.setIsSocketConnected(true));
  };

  private handleDisconnect = () => {
    console.log("disconnected!");

    store.dispatch(actions.setIsSocketConnected(false));
  };

  private handleInitialData = (data: InitData) => {
    store.dispatch(actions.setMessages(data.messages));
    store.dispatch(
      actions.setBroadcastedDrawingPoints(data.broadcastedDrawingPoints)
    );
  };

  private handleMessage = (data: Message) => {
    store.dispatch(actions.setMessage(data));
  };

  private handleDrawingBroadcast = (data: DrawingPoint) => {
    store.dispatch(actions.setBroadcastedDrawingPoint(data));
  };

  private handleDrawGroupCorrection = (data: DrawingPoint[]) => {
    console.log("replacing group");
    store.dispatch(actions.setBroadcastedDrawingPointsGroup(data));
    store.dispatch(actions.setPointsCache([])); // TODO ???????
  };

  private handleDrawGroupValidation = (test: string) => {
    const {
      broadcastedDrawingPoints,
      drawingPointsCache
    } = store.getState().canvas;

    const [user, group, tstampsStr] = test.split("|");
    const tstamps = tstampsStr.split(".");

    const groupIdx = broadcastedDrawingPoints[user]
      ? broadcastedDrawingPoints[user].findIndex(
          arr => arr && arr[0].group === Number(group)
        )
      : -1;

    const isInvalid =
      groupIdx === -1 ||
      !broadcastedDrawingPoints[user][groupIdx] ||
      tstamps.length !== broadcastedDrawingPoints[user][groupIdx].length ||
      !tstamps.every(
        (date, i) =>
          Number(date) === broadcastedDrawingPoints[user][groupIdx][i].date
      );

    if (isInvalid) {
      console.log("invalid");

      const data = { user, group, id: Date.now() };

      this.socket!.emit("correctdatarequest", data);

      this.socket!.once(
        `sendcorrectdrawgroup/${data.id}`,
        (correctGroup: DrawingPoint[]) => {
          const cacheIdx = drawingPointsCache.findIndex(
            arr => arr && arr[0].group === Number(group) && arr[0].user === user
          );

          if (cacheIdx !== -1) {
            store.dispatch(actions.setPointsCache([]));
          }

          store.dispatch(
            actions.setBroadcastedDrawingPointsGroup(correctGroup)
          );
        }
      );
    }
  };
}();
