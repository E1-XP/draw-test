import { Reducer } from "redux";
import { types } from "./../actions/types";

const defaultUser = { username: "" };

export const userReducer: Reducer = (state = defaultUser, action) => {
  switch (action.type) {
    case types.SET_NAME:
      return { ...state, username: action.payload };
  }
  return state;
};
