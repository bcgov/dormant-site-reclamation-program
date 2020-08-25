import * as actionTypes from "../constants/actionTypes";
import { APPLICATIONS } from "../constants/reducerTypes";

const initialState = {
  applications: [],
  application: {},
  applicationApprovedContractedWork: [],
  applicationsApprovedContractedWork: [],
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
    case actionTypes.STORE_APPLICATION_APPROVED_CONTRACTED_WORK:
      return {
        ...state,
        applicationApprovedContractedWork: action.payload,
      };
    case actionTypes.STORE_APPLICATIONS_APPROVED_CONTRACTED_WORK:
      return {
        ...state,
        applicationsApprovedContractedWork: action.payload.records,
        pageData: action.payload,
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
export const getApplicationApprovedContractedWork = (state) =>
  state[APPLICATIONS].applicationApprovedContractedWork;
export const getApplicationsApprovedContractedWork = (state) =>
  state[APPLICATIONS].applicationsApprovedContractedWork;
export const getPageData = (state) => state[APPLICATIONS].pageData;

export default applicationReducerObject;
