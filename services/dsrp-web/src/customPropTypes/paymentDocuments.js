import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const paymentDocument = shape({
  document_guid: PropTypes.string.isRequired,
  object_store_path: PropTypes.string.isRequired,
  document_name: PropTypes.string.isRequired,
  upload_date: PropTypes.string.isRequired,
  active_ind: PropTypes.bool.isRequired,
  payment_document_code: PropTypes.string.isRequired,
  invoice_number: PropTypes.string.isRequired,
  work_ids: PropTypes.arrayOf(PropTypes.string),
  create_user: PropTypes.string.isRequired,
});
