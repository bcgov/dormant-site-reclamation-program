import * as ActionTypes from "../constants/actionTypes";

export const endUserTemporarySession = () => ({
  type: ActionTypes.END_USER_TEMPORARY_SESSION,
});

export const initUserAuthorizationTimer = (data) => ({
  type: ActionTypes.INIT_TEMPORARY_USER_SESSION,
  payload: {
    issuedTimeUtc: new Date(data.issuedTimeUtc),
    timeOutSeconds: Number(data.timeOutSeconds),
  },
});
