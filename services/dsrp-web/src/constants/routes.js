import queryString from "query-string";
import LandingPage from "@/components/pages/LandingPage";
import ReturnPage from "@/components/pages/ReturnPage";
import SubmitApplicationPage from "@/components/pages/SubmitApplicationPage";
import ViewApplicationStatusPage from "@/components/pages/ViewApplicationStatusPage";
import ReviewApplicationsPage from "@/components/pages/ReviewApplicationsPage";
import ReviewApprovedContractedWorkPage from "@/components/pages/ReviewApprovedContractedWorkPage";
import ViewApplicationPage from "@/components/pages/ViewApplicationPage";
import ApplicationSuccessPage from "@/components/pages/ApplicationSuccessPage";
import RequestAccessPage from "@/components/pages/RequestAccessPage";
import ReviewCompanyPaymentInfoPage from "@/components/pages/ReviewCompanyPaymentInfoPage";

export const HOME = {
  route: "/",
  component: LandingPage,
};

export const RETURN_PAGE = {
  route: "/return-page",
  component: ReturnPage,
};

export const SUBMIT_APPLICATION = {
  route: "/submit-application",
  component: SubmitApplicationPage,
};

export const VIEW_APPLICATION_STATUS_LINK = {
  route: "/view-application-status/:id",
  dynamicRoute: (guid) => `/view-application-status/${guid}`,
  component: ViewApplicationStatusPage,
};

export const VIEW_APPLICATION_STATUS = {
  route: "/view-application-status",
  component: ViewApplicationStatusPage,
};

export const APPLICATION_SUCCESS = {
  route: "/success/:id",
  dynamicRoute: (guid) => `/success/${guid}`,
  component: ApplicationSuccessPage,
};

export const REVIEW_APPLICATIONS = {
  route: "/review-applications",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/review-applications?${queryString.stringify({ page, per_page, ...params })}`,
  component: ReviewApplicationsPage,
};

export const REVIEW_APPROVED_CONTRACTED_WORK = {
  route: "/review-approved-contracted-work",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/review-approved-contracted-work?${queryString.stringify({ page, per_page, ...params })}`,
  component: ReviewApprovedContractedWorkPage,
};

export const COMPANY_PAYMENT_INFO = {
  route: "/company-payment-info",
  dynamicRoute: ({ page, per_page, ...params }) =>
    `/company-payment-info?${queryString.stringify({ page, per_page, ...params })}`,
  component: ReviewCompanyPaymentInfoPage,
};

export const VIEW_APPLICATION = {
  route: "/review-applications/:id",
  dynamicRoute: (guid) => `/review-applications/${guid}`,
  component: ViewApplicationPage,
};

export const REQUEST_ACCESS = {
  route: "/request-access/:id",
  dynamicRoute: (guid) => `/request-access/${guid}`,
  component: RequestAccessPage,
};

export const ORGBOOK_URL = "https://orgbook.gov.bc.ca";

export const ORGBOOK_ENTITY_URL = (sourceId) => `${ORGBOOK_URL}/en/organization/${sourceId}`;

export const ORGBOOK_CREDENTIAL_URL = (sourceId, credentialId) =>
  `${ORGBOOK_URL}/en/organization/${sourceId}/cred/${credentialId}`;
