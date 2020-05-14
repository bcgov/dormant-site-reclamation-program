import * as ActionTypes from "../constants/actionTypes";

export const storeApplications = (payload) => ({
  type: ActionTypes.STORE_APPLICATIONS,
  payload,
});

export const storeApplication = (payload) => ({
  type: ActionTypes.STORE_APPLICATION,
  payload,
});
