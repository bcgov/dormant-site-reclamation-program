import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import * as reducerTypes from "../constants/reducerTypes";
import networkReducer from "./networkReducer";

import {
  staticContentReducer,
  modalReducer,
  orgbookReducer,
  authenticationReducer,
  OGCReducer,
  applicationReducer,
  appSettingsReducer,
} from "@/reducers";

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};

export const reducerObject = {
  form: formReducer,
  ...staticContentReducer,
  ...modalReducer,
  ...orgbookReducer,
  ...authenticationReducer,
  ...networkReducer,
  ...OGCReducer,
  ...applicationReducer,
  ...appSettingsReducer,
  [reducerTypes.GET_USER_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_INFO),
};

export const rootReducer = combineReducers(reducerObject);
