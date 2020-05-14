import * as actionTypes from "../constants/actionTypes";
import { APPLICATIONS } from "../constants/reducerTypes";

const initialState = {
  applications: [],
};

export const applicationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_APPLICATIONS:
      return {
        ...state,
        applications: action.payload.records,
      };
    default:
      return state;
  }
};

const applicationReducerObject = {
  [APPLICATIONS]: applicationReducer,
};

export const getApplications = (state) => state[APPLICATIONS].applications;

export default applicationReducerObject;
