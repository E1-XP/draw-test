import express from "express";
import socket, { Socket } from "socket.io";

import { db } from "./models";
import { SocketService } from "./socket";

const PORT = process.env.PORT || 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`listening on ${PORT}`));

export const io = socket(server);

io.on("connection", (socket: Socket) =>
  SocketService.createInstance(db).onConnect(socket)
);
