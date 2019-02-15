import { db, DB, Message, DrawingPoints, DrawingPoint } from "./models";

interface InitData {
  messages: Message[];
  drawingPoints: DrawingPoint[][];
  broadcastedDrawingPoints: DrawingPoints;
  groupCount?: number;
}

export const socketService = new class SocketService {
  private socket;

  constructor(private db: DB) {}

  onConnect = socket => {
    this.socket = socket;
    const username = socket.handshake.query.user;

    console.log(`${username} connected`);

    const omitUserReducer = (acc, itm) => {
      if (itm !== username) acc[itm] = this.db.drawingPoints[itm];
      return acc;
    };

    const broadcastedDrawingPoints = Object.keys(this.db.drawingPoints).reduce(
      omitUserReducer,
      {}
    );

    const drawingPoints = this.db.drawingPoints[username] || [];

    const initData: InitData = {
      messages: this.db.messages,
      drawingPoints,
      broadcastedDrawingPoints
    };
    if (drawingPoints.length) initData.groupCount = drawingPoints.length;

    socket.emit("init", initData);
    console.log("emitted initial data");

    this.bindHandlers(socket);
  };

  private bindHandlers = socket => {
    socket.on("disconnect", this.onDisconnect);

    socket.on("message", this.onMessage);

    socket.on("draw", this.onDraw);

    socket.on("drawend", this.onDrawEnd);

    socket.on("correctdatarequest", this.onCorrectDataRequest);
  };

  private onDisconnect = () => {
    const username = this.socket.handshake.query.user;

    console.log(`disconnected ${username}`);
  };

  private onMessage = data => {
    this.db.messages.push(data);
    this.socket.broadcast.emit("message", data);
  };

  private onDraw = data => {
    const username = this.socket.handshake.query.user;
    const { group } = data;

    this.socket.broadcast.emit("draw", data);

    if (!this.db.drawingPoints[username]) {
      this.db.drawingPoints[username] = [];
    }

    if (!this.db.drawingPoints[username][group]) {
      this.db.drawingPoints[username][group] = [];
    }

    this.db.drawingPoints[username][group].push(data);
  };

  private onDrawEnd = (data: DrawingPoint[]) => {
    const username = this.socket.handshake.query.user;

    if (!this.isSameLengthAndOrder(data)) {
      this.db.drawingPoints[username][data[0].group] = data;

      console.log("incorrect data from sender!");

      this.socket.broadcast.emit("drawgroupcorrection", data);
    } else {
      const tstamps = data.map(point => point.date).join(".");
      const { group, user } = data[0];
      const test = `${user}|${group}|`.concat(tstamps);

      this.socket.broadcast.emit("drawgroupcorrectiontest", test);
    }
  };

  private onCorrectDataRequest = data => {
    const { user, group, id } = data;

    if (!this.db.drawingPoints[user]) return;

    const correctGroup = this.db.drawingPoints[user].find(
      arr => arr[0].group === group
    );
    if (!correctGroup) throw new Error("Group not found.");

    console.log("sending update");

    this.socket.emit(`sendcorrectdrawgroup/${id}`, correctGroup);
  };

  private isSameLengthAndOrder = (data: DrawingPoint[]) => {
    const { group, user } = data[0];

    if (!this.db.drawingPoints[user]) return true;

    const idx = this.db.drawingPoints[user]
      ? this.db.drawingPoints[user].findIndex(
          arr => arr && arr[0].group === group
        )
      : -1;

    if (idx === -1) throw new Error("Group not found.");

    if (data.length !== this.db.drawingPoints[user][idx].length) return false;

    return this.db.drawingPoints[user][idx].every(
      (point, i) => point.x === data[i].x && point.y === data[i].y
    );
  };
}(db);
