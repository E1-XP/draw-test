import * as express from "express";
import socket from "socket.io";

import { socketService } from "./socket";

const PORT = process.env.PORT || 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`listening on ${PORT}`));

const io = socket(server);

io.on("connection", socketService.onConnect);
