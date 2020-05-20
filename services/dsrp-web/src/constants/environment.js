// environment config variables for test/dev/prod
export const DEFAULT_ENVIRONMENT = {
  apiUrl: "http://localhost:5000",
  docManUrl: "http://localhost:1800",
  environment: "development",
  firstNationsLayerUrl: "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov",
  keycloak_resource: "dormant-application-local",
  keycloak_clientId: "dormant-application-local",
  keycloak_idpHint: "test",
  keycloak_url: "https://sso-test.pathfinder.gov.bc.ca/auth",
  siteminder_url: "https://logontest7.gov.bc.ca",
};

export const ENVIRONMENT = {
  apiUrl: "<API_URL>",
  docManUrl: "<DOCUMENT_MANAGER_URL>",
  firstNationsLayerUrl: "<FN_LAYER_URL>",
  environment: "<ENV>",
};

export const KEYCLOAK = {
  realm: "hud2v882",
  "ssl-required": "external",
  url: "<URL>",
  idpHint: "idir",
  resource: "<RESOURCE>",
  "public-client": true,
  "confidential-port": 0,
  clientId: "<CLIENT_ID>",
  loginURL: "<URL>",
  tokenURL: "<URL>",
  userInfoURL: "<URL>",
  keycloakLogoutURL: "<URL>",
  siteMinderLogoutURL: "<URL>",
};

export const USER_ROLES = {
  role_view: "core_view_all",
  role_admin: "core_admin",
  role_edit_reports: "core_edit_reports",
  role_edit_do: "core_edit_do",
  role_edit_securities: "core_edit_securities",
};

export const WINDOW_LOCATION = `${window.location.origin}${process.env.BASE_PATH}`;
export const BCEID_LOGIN_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=login`;
export const KEYCLOAK_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=logout`;
export const SITEMINDER_LOGOUT_REDIRECT_URI = `${WINDOW_LOCATION}/return-page?type=smlogout&retnow=1`;
