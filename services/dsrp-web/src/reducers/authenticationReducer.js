import * as ActionTypes from "@/constants/actionTypes";
import * as ReducerTypes from "@/constants/reducerTypes";
import * as route from "@/constants/routes";
import { AUTHENTICATION } from "../constants/reducerTypes";

/**
 * @file authenticationReducer.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState = {
  isAuthenticated: false,
  userInfo: {},
  redirect: false,
};

export const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE_USER:
      return {
        ...state,
        isAuthenticated: true,
        userInfo: action.payload.userInfo,
        redirect: route.SUBMIT_APPLICATION.route,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userInfo: {},
        redirect: route.HOME.route,
      };
    default:
      return state;
  }
};

const authenticationReducerObject = {
  [AUTHENTICATION]: authenticationReducer,
};

export const isAuthenticated = (state) => state[ReducerTypes.AUTHENTICATION].isAuthenticated;
export const getUserInfo = (state) => state[ReducerTypes.AUTHENTICATION].userInfo;
export const getRedirect = (state) => state[ReducerTypes.AUTHENTICATION].redirect;

export default authenticationReducerObject;
