import queryString from "query-string";

// Static Content
export const STATIC_CONTENT = "/exports/static-content";

// API DOWNLOAD FILE
export const GET_TOKEN_FOR_DOC = (app_guid, doc_guid) =>
  `${APPLICATION_DOCUMENT(app_guid)}/${doc_guid}`;
export const GET_FILE_WITH_TOKEN = (token) => `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_FILE_POST_URL = "/documents";

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;

// Application
// export const APPLICATION = "/application";
export const APPLICATION = (params) =>
  params ? `/application?${queryString.stringify(params)}` : "/application";
export const APPLICATION_BY_ID = (guid) => `/application/${guid}`;
export const APPLICATION_REVIEW = (guid) => `${APPLICATION_BY_ID(guid)}/review`;
export const APPLICATION_DOCUMENT = (guid) => `${APPLICATION_BY_ID(guid)}/documents`;

// OGC
export const PERMIT_HOLDER = () => "/permit_holder";
export const WELL = (params) => `/well?${queryString.stringify(params)}`;
export const LIABILITY = (guid) => (guid ? `/liability?application_guid=${guid}` : "/liability");

//appSettings
export const APP_SETTINGS = "/settings";
