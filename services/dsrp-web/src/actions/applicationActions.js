import * as ActionTypes from "../constants/actionTypes";

export const storeApplications = (payload) => ({
  type: ActionTypes.STORE_APPLICATIONS,
  payload,
});

export const storeApplication = (payload) => ({
  type: ActionTypes.STORE_APPLICATION,
  payload,
});

export const storeApplicationApprovedContractedWork = (payload) => ({
  type: ActionTypes.STORE_APPLICATION_APPROVED_CONTRACTED_WORK,
  payload,
});

export const storeApplicationsApprovedContractedWork = (payload) => ({
  type: ActionTypes.STORE_APPLICATIONS_APPROVED_CONTRACTED_WORK,
  payload,
});
