import { Reducer } from "redux";
import { types } from "./../actions/types";

const defaultGlobal = { isSocketConnected: false };

export const globalReducer: Reducer = (state = defaultGlobal, action) => {
  switch (action.type) {
    case types.SET_IS_SOCKET_CONNECTED: {
      return { ...state, isSocketConnected: action.payload };
    }
  }
  return state;
};
