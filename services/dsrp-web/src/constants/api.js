import queryString from "query-string";

// Static Content
export const STATIC_CONTENT = "/exports/static-content";

// Document Manager
export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;

export const APPLICATION_DOCUMENT = (applicationGuid) => `/applications/${mineGuid}`;

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;

// Application
// export const APPLICATION = "/application";
export const APPLICATION = (params) =>
  params ? `/application?${queryString.stringify(params)}` : "/application";
export const APPLICATION_BY_ID = (guid) => `/application/${guid}`;
export const APPLICATION_REVIEW = (guid) => `${APPLICATION_BY_ID(guid)}/review`;

// OGC
export const PERMIT_HOLDER = () => "/permit_holder";
export const WELL = (params) => `/well?${queryString.stringify(params)}`;
export const LIABILITY = () => "/liability";
