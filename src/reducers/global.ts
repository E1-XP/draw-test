import { Reducer } from "redux";
import { types } from "./../actions/types";

const defaultGlobal = { isSocketConnected: false };

export const globalReducer: Reducer = (state = defaultGlobal, action) => {
  return state;
};
