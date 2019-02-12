import { createStore, Store, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import { rootReducer } from "./reducers";

export interface User {
  username: string;
}

export interface Global {
  isSocketConnected: boolean;
}

export interface DrawingPoint {
  x: number;
  y: number;
  date: number;
  group: number;
  user: string;
}

export interface broadcastedDrawingPoints {
  [key: string]: DrawingPoint[][];
}

export interface Canvas {
  isMouseDown: boolean;
  groupCount: number;
  drawingPoints: DrawingPoint[][];
  broadcastedDrawingPoints: broadcastedDrawingPoints;
}

export interface Message {
  text: string;
  author: string;
}

export interface Chat {
  messages: Message[];
}

export interface State {
  global: Global;
  canvas: Canvas;
  chat: Chat;
  user: User;
}

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store: Store<State> = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);
