import { Reducer } from "redux";
import { types } from "./../actions/types";

const defaultCanvas = {
  isMouseDown: false,
  groupCount: 0,
  drawingPoints: [],
  broadcastedDrawingPoints: {}
};

export const canvasReducer: Reducer = (state = defaultCanvas, action) => {
  switch (action.type) {
    case types.SET_IS_MOUSE_DOWN:
      return { ...state, isMouseDown: action.payload };
    case types.SET_GROUP_COUNT:
      return { ...state, groupCount: action.payload };
  }
  return state;
};
