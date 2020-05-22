import * as ActionTypes from "../constants/actionTypes";

export const storeAppSettings = (payload) => ({
  type: ActionTypes.STORE_APP_SETTINGS,
  payload,
});
