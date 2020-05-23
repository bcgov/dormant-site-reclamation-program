import React from "react";
import PropTypes from "prop-types";
import ApplicationStatusForm from "@/components/forms/ApplicationStatusForm";

const propTypes = {};

export const ApplicationStatusModal = (props) => {
  const handleUpdateStatus = (values) =>
    props.onSubmit(application.guid, { application_status_code: props.status, ...values });

  return <ApplicationStatusForm onSubmit={handleUpdateStatus} {...props} />;
};

ApplicationStatusModal.propTypes = propTypes;

export default ApplicationStatusModal;
