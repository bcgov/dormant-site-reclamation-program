import * as actionTypes from "../constants/actionTypes";
import { APPLICATIONS } from "../constants/reducerTypes";

const initialState = {
  applications: [],
  application: {},
  pageData: {},
};

export const applicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_APPLICATIONS:
      return {
        ...state,
        applications: action.payload.records,
        pageData: action.payload,
      };
    case actionTypes.STORE_APPLICATION:
      return {
        ...state,
        application: action.payload,
      };
    default:
      return state;
  }
};

const applicationReducerObject = {
  [APPLICATIONS]: applicationReducer,
};

export const getApplications = (state) => state[APPLICATIONS].applications;
export const getApplication = (state) => state[APPLICATIONS].application;
export const getPageData = (state) => state[APPLICATIONS].pageData;

export default applicationReducerObject;
