import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const document = shape({
  document_guid: PropTypes.string.isRequired,
  object_store_path: PropTypes.string,
  upload_date: PropTypes.string,
  document_name: PropTypes.string,
  active_ind: PropTypes.boolean,
});
