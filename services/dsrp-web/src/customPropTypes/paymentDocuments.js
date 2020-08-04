import { PropTypes, shape } from "prop-types";

// eslint-disable-next-line import/prefer-default-export
export const paymentDocuments = shape({
  document_guid: PropTypes.string.isRequired,
  object_store_path: PropTypes.string.isRequired,
  document_name: PropTypes.string.isRequired,
  active_ind: PropTypes.bool.isRequired,
  payment_document_code: PropTypes.string.isRequired,
  invoice_number: PropTypes.string.isRequired,
});
