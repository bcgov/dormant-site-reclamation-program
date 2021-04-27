import React from "react";
import PropTypes from "prop-types";
import AdminOverrideEstimatedCostForm from "@/components/forms/AdminOverrideEstimatedCostForm";

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.any.isRequired,
};

export const AdminOverrideEstimatedCostModal = (props) => {
  const handleSubmit = (values) =>
    props.onSubmit(props.contractedWork.application_guid, props.contractedWork.work_id, values);
  return (
    <AdminOverrideEstimatedCostForm
      onSubmit={handleSubmit}
      closeModal={props.closeModal}
      initialValues={props.initialValues}
    />
  );
};

AdminOverrideEstimatedCostModal.propTypes = propTypes;

export default AdminOverrideEstimatedCostModal;
