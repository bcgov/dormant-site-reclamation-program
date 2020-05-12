import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const document = shape({
  document_guid: PropTypes.string.isRequired,
  document_manager_guid: PropTypes.string,
  document_name: PropTypes.string,
  active_ind: PropTypes.boolean,
});
