import queryString from "query-string";

// Static Content
export const STATIC_CONTENT = "/exports/static-content";

// Application
// export const APPLICATION = "/application";
export const APPLICATION = (params) =>
  params ? `/application?${queryString.stringify(params)}` : "/application";
export const STATUS = (guid) => `/application/${guid}/status`;
export const APPLICATION_BY_ID = (guid) => `/application/${guid}`;
export const APPLICATION_SUMMARY_BY_ID = (guid) => `/application/${guid}/summary`;
export const APPLICATION_REVIEW = (guid) => `${APPLICATION_BY_ID(guid)}/review`;
export const APPLICATION_DOCUMENT = (guid) => `${APPLICATION_BY_ID(guid)}/documents`;
export const APPLICATION_PAYMENT_DOCUMENT = (guid) => `/application/${guid}/payment-doc`;
export const APPLICATION_PAYMENT_DOCUMENT_BY_GUID = (guid, documentGuid) =>
  `${APPLICATION_PAYMENT_DOCUMENT(guid)}/${documentGuid}`;
export const APPLICATION_APPROVED_CONTRACTED_WORK = (params) =>
  params
    ? `/application/approved-contracted-work?${queryString.stringify(params)}`
    : "/application/approved-contracted-work";
export const APPLICATION_APPROVED_CONTRACTED_WORK_BY_ID = (guid) =>
  `/application/${guid}/approved-contracted-work`;

export const APPLICATION_CONTRACTED_WORK_PAYMENT = (applicationGuid, workId) =>
  `/application/${applicationGuid}/contracted-work-payment/${workId}`;
export const UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM = (applicationGuid, workId) =>
  `${APPLICATION_CONTRACTED_WORK_PAYMENT(applicationGuid, workId)}/interim`;
export const UPDATE_CONTRACTED_WORK_PAYMENT_FINAL = (applicationGuid, workId) =>
  `${APPLICATION_CONTRACTED_WORK_PAYMENT(applicationGuid, workId)}/final`;
export const UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM_REPORT = (applicationGuid, workId) =>
  `${APPLICATION_CONTRACTED_WORK_PAYMENT(applicationGuid, workId)}/interim-report`;
export const CREATE_CONTRACTED_WORK_PAYMENT_STATUS = (applicationGuid, workId) =>
  `${APPLICATION_CONTRACTED_WORK_PAYMENT(applicationGuid, workId)}/status`;
export const UPDATE_CONTRACTED_WORK_PAYMENT_AUDIT_STATUS = (applicationGuid, workId) =>
  `${APPLICATION_CONTRACTED_WORK_PAYMENT(applicationGuid, workId)}/audit`;
export const UPDATE_APPLICATION_ESTIMATED_COST_OVERRIDE = (applicationGuid, workId) =>
  `/application/${applicationGuid}/work/${workId}/estimated-cost-override`;

// Documents
export const GET_TOKEN_FOR_DOC = (app_guid, doc_guid) =>
  `${APPLICATION_DOCUMENT(app_guid)}/${doc_guid}`;
export const GET_FILE_WITH_TOKEN = (token) => `/documents?${queryString.stringify(token)}`;
export const GET_TOKEN_FOR_SHARED_COST_AGREE_LETTER = (app_guid) =>
  `/application/${app_guid}/generate-doc/shared-cost-agreement`;
export const GET_PAYMENT_DOCUMENT_WITH_TOKEN = (token) =>
  `/documents/payment-doc?${queryString.stringify(token)}`;

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;

// OGC
export const PERMIT_HOLDER = () => "/permit_holder";
// '/well' calls wells api directly on OGC side
export const WELL = (params) => `/well?${queryString.stringify(params)}`;

// '/nominatedwell' DSRP api with prepopulated list of wells
export const NOMINATED_WELL = (params) => `/nominatedwell?${queryString.stringify(params)}`;
export const LIABILITY = (guid) => (guid ? `/liability?application_guid=${guid}` : "/liability");

// appSettings
export const APP_SETTINGS = "/settings";

// OTP AUTHORIZATION
export const AUTHORIZE_OTP = "/authorization";

// Company Payment Info
export const GET_COMPANY_PAYMENT_INFO = (params) => `/company-payment-info`;
export const UPDATE_COMPANY_PAYMENT_INFO = (companyName) => `/company-payment-info/${companyName}`;
export const CREATE_COMPANY_PAYMENT_INFO = (params) => `/company-payment-info`;
