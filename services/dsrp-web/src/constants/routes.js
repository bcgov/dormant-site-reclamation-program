import LandingPage from "@/components/pages/LandingPage";
import ReturnPage from "@/components/pages/ReturnPage";
import SubmitApplicationPage from "@/components/pages/SubmitApplicationPage";
import ViewApplicationStatusPage from "@/components/pages/ViewApplicationStatusPage";
import ReviewApplicationsPage from "@/components/pages/ReviewApplicationsPage";
import SubmissionForm from "@/components/pages/SubmissionForm";

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

export const VIEW_APPLICATION_STATUS = {
  route: "/view-application-status",
  component: ViewApplicationStatusPage,
};

export const REVIEW_APPLICATIONS = {
  route: "/review-applications",
  component: ReviewApplicationsPage,
};

export const SUBMISSION_FORM = {
  route: "/submission",
  component: SubmissionForm,
};
