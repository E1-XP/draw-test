import { combineReducers } from "redux";

import { globalReducer } from "./global";
import { userReducer } from "./user";
import { chatReducer } from "./chat";
import { canvasReducer } from "./canvas";

export const rootReducer = combineReducers({
  global: globalReducer,
  user: userReducer,
  canvas: canvasReducer,
  chat: chatReducer
});
