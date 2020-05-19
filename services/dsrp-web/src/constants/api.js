import queryString from "query-string";

// Static Content
export const CORE_STATIC_CONTENT = "/exports/core-static-content";

// Document Manager
export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_TOKEN_GET_URL = (documentManagerGuid) =>
  `/download-token/${documentManagerGuid}`;

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;

// Application
// export const APPLICATION = "/application";
export const APPLICATION = (params) =>
  params ? `/application?${queryString.stringify(params)}` : "/application";
export const APPLICATION_BY_ID = (guid) => `/application/${guid}`;

// OGC
export const PERMIT_HOLDER = () => "/permit_holder";
export const WELL = (params) => `/well?${queryString.stringify(params)}`;
export const LIABILITY = () => "/liability";
