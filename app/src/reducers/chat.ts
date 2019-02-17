import { Reducer } from "redux";
import { types } from "./../actions/types";

const defaultChat = { messages: [] };

export const chatReducer: Reducer = (state = defaultChat, action) => {
  switch (action.type) {
    case types.SET_MESSAGE:
      return { ...state, messages: state.messages.concat(action.payload) };
    case types.SET_MESSAGES:
      return { ...state, messages: action.payload };
  }
  return state;
};
