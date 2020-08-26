import React from "react";
import PropTypes from "prop-types";
import AdminChangeContractedWorkPaymentStatusForm from "@/components/forms/AdminChangeContractedWorkPaymentStatusForm";

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkPaymentStatus: PropTypes.string.isRequired,
  contractedWorkPaymentType: PropTypes.string.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const AdminChangeContractedWorkPaymentStatusModal = (props) => {
  const handleSubmit = (values) =>
    props.onSubmit(props.contractedWork, {
      contracted_work_payment_status_code: props.contractedWorkPaymentStatus,
      contracted_work_payment_code: props.contractedWorkPaymentType,
      ...values,
    });

  return (
    <AdminChangeContractedWorkPaymentStatusForm
      onSubmit={handleSubmit}
      contractedWork={props.contractedWork}
      contractedWorkPaymentStatus={props.contractedWorkPaymentStatus}
      contractedWorkPaymentType={props.contractedWorkPaymentType}
      contractedWorkPaymentStatusOptionsHash={props.contractedWorkPaymentStatusOptionsHash}
      closeModal={props.closeModal}
    />
  );
};

AdminChangeContractedWorkPaymentStatusModal.propTypes = propTypes;

export default AdminChangeContractedWorkPaymentStatusModal;
