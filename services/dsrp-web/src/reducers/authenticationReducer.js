import * as ActionTypes from "@/constants/actionTypes";
import * as route from "@/constants/routes";
import { AUTHENTICATION, GET_USER_INFO } from "../constants/reducerTypes";

/**
 * @file authenticationReducer.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState = {
  isAuthenticated: false,
  userInfo: {},
  redirect: false,
  userRoles: [],
  isAdmin: false,
};

export const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE_USER:
      return {
        ...state,
        isAuthenticated: true,
        userInfo: action.payload.userInfo,
        redirect: route.REVIEW_APPLICATIONS.route,
      };
    case ActionTypes.STORE_USER_ACCESS_DATA:
      return {
        ...state,
        isAdmin: action.payload.token.realm_access.roles.includes("admin"),
        userRoles: action.payload.token.realm_access.roles,
        isViewOnly: action.payload.token.realm_access.roles.includes("view_all"),
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

export const isAuthenticated = (state) => state[AUTHENTICATION].isAuthenticated;
export const getUserInfo = (state) => state[AUTHENTICATION].userInfo;
export const getRedirect = (state) => state[AUTHENTICATION].redirect;
export const getUserRoles = (state) => state[AUTHENTICATION].userRoles;
export const getIsAdmin = (state) => state[AUTHENTICATION].isAdmin;
export const getIsViewOnly = (state) => state[AUTHENTICATION].isViewOnly;

export const userLoading = (state) => state[GET_USER_INFO].isFetching;

export default authenticationReducerObject;
