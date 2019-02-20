import { connect } from "socket.io-client";

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

interface CorrectGroupRequest {
  user: string;
  group: number;
}

export const socketService = new class SocketService {
  private socket: SocketIOClient.Socket | undefined;

  private API_URL = "http://localhost:3001";

  start() {
    const state = store.getState();

    this.socket = connect(
      this.API_URL,
      { query: `user=${state.user.username}` }
    );

    this.socket.on("connect", this.handleConnect.bind(this));
  }

  closeSocket() {
    if (!this.socket) return;

    this.socket.close();
    store.dispatch(actions.setIsSocketConnected(false));
  }

  get() {
    if (!this.socket) throw new Error("socket is undefined");
    return this.socket;
  }

  private subscribeToEvents() {
    if (!this.socket) throw new Error("Socket is not connected!");

    this.socket.on("disconnect", this.handleDisconnect.bind(this));

    this.socket.on("INIT", this.handleInitialData.bind(this));

    this.socket.on("SET_USER_DRAW_DATA", this.handleSetUserDrawData.bind(this));

    this.socket.on("MESSAGE", this.handleMessage.bind(this));

    this.socket.on("DRAW", this.handleDrawingBroadcast.bind(this));

    this.socket.on(
      "DRAW_GROUP_CORRECTION",
      this.handleDrawGroupCorrection.bind(this)
    );

    this.socket.on(
      "DRAW_GROUP_CORRECTION_TEST",
      this.handleDrawGroupValidation.bind(this)
    );

    this.socket.on(
      "SEND_CORRECT_DRAW_GROUP",
      this.handleSendCorrectGroupToServer.bind(this)
    );
  }

  private handleConnect() {
    this.subscribeToEvents();

    store.dispatch(actions.setIsSocketConnected(true));
  }

  private handleDisconnect() {
    console.log("disconnected!");

    store.dispatch(actions.setIsSocketConnected(false));
  }

  private handleInitialData(data: InitData) {
    const { drawingPoints } = store.getState().canvas;

    if (drawingPoints.length) {
      this.socket!.emit("SEND_DRAW_DATA_ON_RECONNECT", drawingPoints);
    }

    store.dispatch(actions.setMessages(data.messages));
    store.dispatch(
      actions.setBroadcastedDrawingPoints(data.broadcastedDrawingPoints)
    );
  }

  private handleMessage(data: Message) {
    store.dispatch(actions.setMessage(data));
  }

  private handleSetUserDrawData(data: DrawingPoint[][]) {
    store.dispatch(actions.setBroadcastedUserDrawingPoints(data));
  }

  private handleDrawingBroadcast(data: DrawingPoint) {
    console.log("received");
    store.dispatch(actions.setBroadcastedDrawingPoint(data));
  }

  private handleDrawGroupCorrection(data: DrawingPoint[]) {
    console.log("replacing group");
    store.dispatch(actions.setBroadcastedDrawingPointsGroup(data));
    store.dispatch(actions.setPointsCache([])); // TODO ???????
  }

  private handleSendCorrectGroupToServer(data: CorrectGroupRequest) {
    const { user, group } = data;
    const { drawingPoints } = store.getState().canvas;

    const correctGroup = drawingPoints.find(
      arr => arr && arr[0] && arr[0].group === group
    );

    if (correctGroup) {
      this.socket!.emit("SEND_CORRECT_DRAW_GROUP", correctGroup);
    }
  }

  private handleDrawGroupValidation(test: string) {
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

      this.socket!.emit("CORRECT_DATA_REQUEST", data);

      const setCorrectGroup = (correctGroup: DrawingPoint[]) => {
        const cacheIdx = drawingPointsCache.findIndex(
          arr => arr && arr[0].group === Number(group) && arr[0].user === user
        );

        if (cacheIdx !== -1) {
          store.dispatch(actions.setPointsCache([]));
        }

        store.dispatch(actions.setBroadcastedDrawingPointsGroup(correctGroup));
      };

      this.socket!.once(`SEND_CORRECT_DRAW_GROUP/${data.id}`, setCorrectGroup);
    }
  }
}();
