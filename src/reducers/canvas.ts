import { Reducer } from "redux";
import { Canvas } from "./../store";
import { types } from "./../actions/types";
import { type } from "os";

const defaultCanvas = {
  isMouseDown: false,
  groupCount: 0,
  drawingPoints: [],
  broadcastedDrawingPoints: {},
  drawingPointsCache: []
};

export const canvasReducer: Reducer<Canvas> = (
  state = defaultCanvas,
  action
) => {
  switch (action.type) {
    case types.SET_IS_MOUSE_DOWN:
      return { ...state, isMouseDown: action.payload };
    case types.SET_GROUP_COUNT:
      return { ...state, groupCount: action.payload };
    case types.SET_DRAWING_POINT: {
      const { group } = action.payload;

      const drawingPoints = state.drawingPoints.slice();
      if (!drawingPoints[group]) drawingPoints[group] = [];

      drawingPoints[group].push(action.payload);

      return { ...state, drawingPoints };
    }
    case types.SET_DRAWING_POINTS: {
      const drawingPoints = action.payload;

      return { ...state, drawingPoints };
    }
    case types.SET_BROADCASTED_DRAWING_POINT: {
      const { user, group } = action.payload;

      const broadcastedDrawingPoints = Object.assign(
        {},
        state.broadcastedDrawingPoints
      );

      if (!broadcastedDrawingPoints[user]) {
        broadcastedDrawingPoints[user] = [];
      }
      if (!broadcastedDrawingPoints[user][group]) {
        broadcastedDrawingPoints[user][group] = [];
      }

      broadcastedDrawingPoints[user][group].push(action.payload);

      return { ...state, broadcastedDrawingPoints };
    }
    case types.SET_BROADCASTED_DRAWING_POINTS: {
      const broadcastedDrawingPoints = action.payload;

      return { ...state, broadcastedDrawingPoints };
    }
    case types.SET_BROADCASTED_DRAWING_POINTS_GROUP: {
      const { user, group } = action.payload;

      const broadcastedDrawingPoints = Object.assign(
        {},
        state.broadcastedDrawingPoints
      );
      broadcastedDrawingPoints[user].map(arr =>
        arr[0].group === group ? action.payload : arr
      );

      return { ...state, broadcastedDrawingPoints };
    }
    case types.SET_POINTS_CACHE: {
      const drawingPointsCache = action.payload;
      return { ...state, drawingPointsCache };
    }
  }
  return state;
};
