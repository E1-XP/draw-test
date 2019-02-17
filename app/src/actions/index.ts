import { ActionCreator, Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { types } from "./types";
import {
  Message,
  DrawingPoint,
  broadcastedDrawingPoints,
  State
} from "./../store";

export const startApp = () => ({ type: types.APP_START });

export const setIsSocketConnected = (v: boolean) => ({
  type: types.SET_IS_SOCKET_CONNECTED,
  payload: v
});

export const setName = (v: string) => ({ type: types.SET_NAME, payload: v });

export const setMessage = (v: Message) => ({
  type: types.SET_MESSAGE,
  payload: v
});

export const setMessages = (v: Message[]) => ({
  type: types.SET_MESSAGES,
  payload: v
});

export const setIsMouseDown = (v: boolean) => ({
  type: types.SET_IS_MOUSE_DOWN,
  payload: v
});

export const setGroupCount = (v: number) => ({
  type: types.SET_GROUP_COUNT,
  payload: v
});

export const setDrawingPoint = (v: DrawingPoint) => ({
  type: types.SET_DRAWING_POINT,
  payload: v
});

export const setDrawingPoints = (v: DrawingPoint[]) => ({
  type: types.SET_DRAWING_POINTS,
  payload: v
});

export const setBroadcastedDrawingPoint = (v: DrawingPoint) => ({
  type: types.SET_BROADCASTED_DRAWING_POINT,
  payload: v
});

export const setBroadcastedDrawingPoints = (v: broadcastedDrawingPoints) => ({
  type: types.SET_BROADCASTED_DRAWING_POINTS,
  payload: v
});

export const setBroadcastedDrawingPointsGroup = (v: DrawingPoint[]) => ({
  type: types.SET_BROADCASTED_DRAWING_POINTS_GROUP,
  payload: v
});

export const setPointsCache = (v: DrawingPoint[][]) => ({
  type: types.SET_POINTS_CACHE,
  payload: v
});
