import { Socket } from "socket.io";
import { db, DB, Message, DrawingPoints, DrawingPoint } from "./models";

interface InitData {
  messages: Message[];
  broadcastedDrawingPoints: DrawingPoints;
}

interface CorrectDataRequest {
  user: string;
  group: number;
  id: number;
}

export class SocketService {
  private socket: Socket | null = null;

  constructor(private db: DB) {}

  static createInstance(db: DB) {
    return new SocketService(db);
  }

  onConnect(socket: Socket) {
    this.socket = socket;

    const username = socket.handshake.query.user;
    
    console.log(`${username} connected ${socket.id}`);

    this.handleInit();
    this.bindHandlers();
  }

  private bindHandlers() {
    if (!this.socket) return console.log("socket is undefined");

    this.socket.on("disconnect", this.onDisconnect.bind(this));

    this.socket.on(
      "SEND_DRAW_DATA_ON_RECONNECT",
      this.handleSendDataOnReconnect.bind(this)
    );

    this.socket.on("MESSAGE", this.onMessage.bind(this));

    this.socket.on("DRAW", this.onDraw.bind(this));

    this.socket.on("DRAW_END", this.onDrawEnd.bind(this));

    this.socket.on(
      "CORRECT_DATA_REQUEST",
      this.onCorrectDataRequest.bind(this)
    );
  }

  private onDisconnect() {
    const username = this.socket!.handshake.query.user;

    console.log(`disconnected ${username}`);
  }

  private onMessage(data: Message) {
    this.db.messages.push(data);
    this.socket!.broadcast.emit("MESSAGE", data);
  }

  private handleInit() {
    const username = this.socket!.handshake.query.user;

    const omitUserReducer = (acc: DrawingPoints, itm: string) => {
      if (itm !== username) acc[itm] = this.db.drawingPoints[itm];
      return acc;
    };

    const broadcastedDrawingPoints = Object.keys(this.db.drawingPoints).reduce(
      omitUserReducer,
      {}
    );

    const initData: InitData = {
      messages: this.db.messages,
      broadcastedDrawingPoints
    };

    this.socket!.emit("INIT", initData);
    console.log("emitted initial data");
  }

  private handleSendDataOnReconnect(data: DrawingPoint[][]) {
    const { user } = data[0][0];

    this.db.drawingPoints[user] = data;
    this.socket!.broadcast.emit("SET_USER_DRAW_DATA", data);
  }

  private onDraw(data: DrawingPoint) {
    const username = this.socket!.handshake.query.user;
    const { group } = data;

    this.socket!.broadcast.emit("DRAW", data);

    if (!this.db.drawingPoints[username]) {
      this.db.drawingPoints[username] = [];
    }

    if (!this.db.drawingPoints[username][group]) {
      this.db.drawingPoints[username][group] = [];
    }

    this.db.drawingPoints[username][group].push(data);
  }

  private onDrawEnd(test: string) {
    const [user, group, tstamps] = test.split("|");
    const numStamps = tstamps.split(".").map(itm => Number(itm));

    if (!this.isSameLengthAndOrder(user, Number(group), numStamps)) {
      console.log("incorrect data from sender!");

      const data = { user, group: Number(group) };
      this.socket!.emit("SEND_CORRECT_DRAW_GROUP", data);

      this.socket!.on("SEND_CORRECT_DRAW_GROUP", data => {
        this.db.drawingPoints[user][Number(group)] = data;

        this.socket!.broadcast.emit("DRAW_GROUP_CORRECTION", data);
      });
    } else {
      this.socket!.broadcast.emit("DRAW_GROUP_CORRECTION_TEST", test);
    }
  }

  private onCorrectDataRequest(data: CorrectDataRequest) {
    const { user, group, id } = data;

    if (!this.db.drawingPoints[user]) return;

    const correctGroup = this.db.drawingPoints[user].find(
      arr => arr[0].group === group
    );
    if (!correctGroup) return;

    console.log("sending update");

    this.socket!.emit(`SEND_CORRECT_DRAW_GROUP/${id}`, correctGroup);
  }

  private isSameLengthAndOrder(user: string, group: number, tstamps: number[]) {
    if (!this.db.drawingPoints[user]) return true;

    const idx = this.db.drawingPoints[user]
      ? this.db.drawingPoints[user].findIndex(
          arr => arr && arr[0].group === group
        )
      : -1;

    if (idx === -1) return true;

    if (tstamps.length !== this.db.drawingPoints[user][idx].length) {
      return false;
    }

    return this.db.drawingPoints[user][idx].every(
      (point, i) => point.date === tstamps[i]
    );
  }
}
