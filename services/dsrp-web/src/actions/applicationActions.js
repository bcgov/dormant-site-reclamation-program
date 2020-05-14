import * as ActionTypes from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeApplications = (payload) => ({
  type: ActionTypes.STORE_APPLICATIONS,
  payload,
});

export const storeApplication = (payload) => ({
  type: ActionTypes.STORE_APPLICATION,
  payload,
});
