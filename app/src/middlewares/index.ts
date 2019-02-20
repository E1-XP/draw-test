import { Middleware } from "redux";

import { State } from "./../store";
import { types } from "./../actions/types";

import { socketService } from "./../services/socket";

export const socketMiddleware: Middleware<
  {},
  State
> = store => next => action => {
  switch (action.type) {
    case types.SET_MESSAGE: {
      socketService.get().emit("MESSAGE", action.payload);
      break;
    }
    case types.SET_DRAWING_POINT: {
      console.log("drawing");
      socketService.get().emit("DRAW", action.payload);
      break;
    }
    case types.SET_IS_MOUSE_DOWN: {
      if (!action.payload) {
        const { drawingPoints, groupCount } = store.getState().canvas;

        const lastGroup = drawingPoints.find(
          arr => arr && arr[0] && arr[0].group === groupCount
        );

        if (lastGroup && lastGroup.length && lastGroup.every(itm => !!itm)) {
          const { user, group } = lastGroup[0];
          const tstamps = lastGroup.map(point => point.date).join(".");
          const groupToStr = `${user}|${group}|`.concat(tstamps);

          socketService.get().emit("DRAW_END", groupToStr);
        }
      }
      break;
    }
  }

  return next(action);
};
