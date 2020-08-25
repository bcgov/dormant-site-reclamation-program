import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const applicationSummary = shape({
  id: PropTypes.number,
  guid: PropTypes.string,
  application_status_code: PropTypes.string,
  submission_date: PropTypes.string,
  company_name: PropTypes.string,
  applicant_name: PropTypes.string,
});
