import React from "react";
import PropTypes from "prop-types";
import AdminEditApplicationForm from "@/components/forms/AdminEditApplicationForm";

const propTypes = {
  application: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const AdminEditApplicationModal = (props) => {
  const handleSubmit = (values) => props.onSubmit(props.application.guid, values);
  return <AdminEditApplicationForm onSubmit={handleSubmit} closeModal={props.closeModal} />;
};

AdminEditApplicationModal.propTypes = propTypes;

export default AdminEditApplicationModal;
