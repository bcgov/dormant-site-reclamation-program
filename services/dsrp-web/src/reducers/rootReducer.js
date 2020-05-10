import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import {
  staticContentReducer,
  modalReducer,
  orgbookReducer,
  authenticationReducer,
  networkReducer,
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
  loadingBar: loadingBarReducer,
  ...staticContentReducer,
  ...modalReducer,
  ...orgbookReducer,
  ...authenticationReducer,
  ...networkReducer,
};

export const rootReducer = combineReducers(reducerObject);
