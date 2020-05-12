/**
 * Utility class for various request Headers.
 */

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const createRequestHeader = () => {
  let requestHeaders = { headers: {} };
  requestHeaders.headers["Access-Control-Allow-Origin"] = "*";
  const jwtToken = localStorage.getItem("jwt");
  if (jwtToken) {
    requestHeaders.headers["Authorization"] = `Bearer ${jwtToken}`;
  }
  return requestHeaders;
};
