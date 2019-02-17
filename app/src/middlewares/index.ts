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
      socketService.get().emit("message", action.payload);
      break;
    }
    case types.SET_DRAWING_POINT: {
      socketService.get().emit("draw", action.payload);
      break;
    }
    case types.SET_IS_MOUSE_DOWN: {
      if (!action.payload) {
        const { drawingPoints, groupCount } = store.getState().canvas;

        const lastGroup = drawingPoints.find(
          arr => arr && arr[0] && arr[0].group === groupCount
        );
        // TODO ?
        if (lastGroup) socketService.get().emit("drawend", lastGroup);
      }
      break;
    }
  }

  return next(action);
};
