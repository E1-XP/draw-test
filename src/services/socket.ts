import { connect, Socket } from "socket.io-client";

import {
  store,
  Message,
  DrawingPoint,
  broadcastedDrawingPoints
} from "./../store";
import * as actions from "./../actions";
import { Action } from "redux";

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
  };

  closeSocket = () => {
    Socket.close();
    store.dispatch(actions.setIsSocketConnected(false));
  };

  get = () => {
    if (!this.socket) throw new Error("socket is undefined");
    return this.socket;
  };

  private subscribeToEvents = () => {
    if (!this.socket) throw new Error("Socket is not connected!");

    this.socket.on("disconnect", this.handleDisconnect);

    this.socket.on("init", this.handleInit);

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
  };

  private handleInit = (data: InitData) => {
    console.log(data);
    store.dispatch(actions.setMessages(data.messages));
    store.dispatch(actions.setDrawingPoints(data.drawingPoints));
    store.dispatch(
      actions.setBroadcastedDrawingPoints(data.broadcastedDrawingPoints)
    );
  };

  private handleMessage = (data: Message) => {
    store.dispatch(actions.setMessage(data));
  };

  private handleDrawingBroadcast = (data: DrawingPoint) => {};

  private handleDrawGroupCorrection = () => {};

  private handleDrawGroupValidation = () => {};
}();
