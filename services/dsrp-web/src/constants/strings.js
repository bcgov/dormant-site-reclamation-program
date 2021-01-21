export const ERROR = "Error";
export const DASH = "-";
export const NA = "N/A";
export const DATE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_PAGE_NUMBER = 1;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100, 250];
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[2];
export const HELP_EMAIL = "DormantSite.BC.Government@gov.bc.ca";

export const RETURN_PAGE_TYPE = {
  LOGIN: "login",
  SITEMINDER_LOGOUT: "smlogout",
  LOGOUT: "logout",
};

// Admin Settings
export const DISABLE_APPLICATIONS = "disable_applications";

export const PROGRAM_START_DATE = "2020-05-25";
export const PROGRAM_END_DATE = "2022-12-31";

export const REVIEW_DEADLINE_NOT_APPLICABLE = "9999-12-30T23:59:59.999999";
export const REVIEW_DEADLINE_PAID = "9999-12-31T23:59:59.999999";

export const APPLICATION_PHASE_CODES = {
  INITIAL: "INITIAL",
  NOMINATION: "NOMINATION",
};

export const INDIGENOUS_APPLICANT_AFFILIATION_SELECT_OPTIONS = [
  {
    value: "COMMUNITY_OWNED_LESS_THAN_51",
    label: "Owned by an Indigenous community (less than 51%)",
  },
  {
    value: "COMMUNITY_OWNED_GREATER_THAN_51",
    label: "Owned by an Indigenous community (at least 51%)",
  },
  {
    value: "PERSON_OWNED_LESS_THAN_51",
    label: "Owned by an Indigenous person (less than 51%)",
  },
  {
    value: "PERSON_OWNED_GREATER_THAN_51",
    label: "Owned by an Indigenous person (at least 51%)",
  },
  {
    value: "PARTNERSHIP_REVENUE_SHARING",
    label: "Partnership (revenue sharing) that is endorsed by an Indigenous community",
  },
  {
    value: "PARTNERSHIP_NON_REVENUE_SHARING",
    label: "Partnership (non-revenue sharing) that is endorsed by an Indigenous community",
  },
  {
    value: "NONE",
    label: "No Indigenous affiliation",
  },
];

export const DEFAULT_INDIGENOUS_COMMUNITIES_SELECT_OPTIONS = [
  {
    value: "Blueberry River First Nations",
    label: "Blueberry River First Nations",
  },
  {
    value: "Doig River First Nation",
    label: "Doig River First Nation",
  },
  {
    value: "Fort Nelson First Nation",
    label: "Fort Nelson First Nation",
  },
  {
    value: "Halfway River First Nation",
    label: "Halfway River First Nation",
  },
  {
    value: "MacLeod Lake Indian Band",
    label: "MacLeod Lake Indian Band",
  },
  {
    value: "Prophet River First Nation",
    label: "Prophet River First Nation",
  },
  {
    value: "Saulteau First Nations",
    label: "Saulteau First Nations",
  },
  {
    value: "West Moberly First Nations",
    label: "West Moberly First Nations",
  },
];

export const INDIGENOUS_SUBCONTRACTOR_AFFILIATION_SELECT_OPTIONS = [
  {
    value: "COMMUNITY_OWNED_LESS_THAN_51",
    label: "Owned by an Indigenous community (less than 51%)",
  },
  {
    value: "COMMUNITY_OWNED_GREATER_THAN_51",
    label: "Owned by an Indigenous community (at least 51%)",
  },
  {
    value: "PERSON_OWNED_LESS_THAN_51",
    label: "Owned by an Indigenous person (less than 51%)",
  },
  {
    value: "PERSON_OWNED_GREATER_THAN_51",
    label: "Owned by an Indigenous person (at least 51%)",
  },
];
