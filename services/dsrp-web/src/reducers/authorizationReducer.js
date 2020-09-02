import * as ActionTypes from "@/constants/actionTypes";
import * as route from "@/constants/routes";
import { AUTHORIZATION } from "../constants/reducerTypes";

/**
 * @file authorizationReducerObject.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState = {
  isOTLExpired: false,
  isTimerVisible: false,
  issuedTimeUtc: null,
  timeOutSeconds: null,
};

export const authorizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.END_USER_TEMPORARY_SESSION:
      return {
        ...state,
        isOTLExpired: true,
        isTimerVisible: false,
        redirect: route.REQUEST_ACCESS.route,
      };
    case ActionTypes.INIT_TEMPORARY_USER_SESSION:
      return {
        ...state,
        isOTLExpired: false,
        isTimerVisible: true,
        issuedTimeUtc: action.payload.issuedTimeUtc,
        timeOutSeconds: action.payload.timeOutSeconds,
      };
    default:
      return state;
  }
};

const authorizationReducerObject = {
  [AUTHORIZATION]: authorizationReducer,
};

export const getIsOTLExpired = (state) => state[AUTHORIZATION].isOTLExpired;
export const getIsTimerVisible = (state) => state[AUTHORIZATION].isTimerVisible;
export const getIssuedTimeUtc = (state) => state[AUTHORIZATION].issuedTimeUtc;
export const getTimeOutSeconds = (state) => state[AUTHORIZATION].timeOutSeconds;

export default authorizationReducerObject;
