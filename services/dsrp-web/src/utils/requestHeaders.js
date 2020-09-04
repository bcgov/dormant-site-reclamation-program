/**
 * Utility class for various request Headers.
 */

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const createRequestHeader = () => {
  const requestHeaders = { headers: {} };
  requestHeaders.headers["Access-Control-Allow-Origin"] = "*";
  const jwtToken = localStorage.getItem("jwt");
  if (jwtToken) {
    requestHeaders.headers.Authorization = `Bearer ${jwtToken}`;
  }

  const app_guid = localStorage.getItem("app_guid");
  const otp = localStorage.getItem("otp");
  if (otp && app_guid) {
    requestHeaders.headers.app_guid = app_guid;
    requestHeaders.headers.otp = otp;
  }

  return requestHeaders;
};
