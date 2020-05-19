import * as actionTypes from "../constants/actionTypes";
import { STATIC_CONTENT } from "../constants/reducerTypes";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled within this reducer.
 */

const initialState = {};

export const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_BULK_STATIC_CONTENT:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const staticContentReducerObject = {
  [STATIC_CONTENT]: staticContentReducer,
};

const isStaticContentLoaded = (state) =>
  Object.keys(state)
    // eslint-disable-next-line no-prototype-builtins
    .filter((p) => state.hasOwnProperty(p) && Array.isArray(state[p]))
    .every((p) => state[p].length > 0);

export const getStaticContentLoadingIsComplete = (state) =>
  isStaticContentLoaded(state[STATIC_CONTENT]);

export default staticContentReducerObject;
