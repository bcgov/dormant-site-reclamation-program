import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import AdminChangeContractedWorkPaymentStatusApprovedForm from "@/components/forms/AdminChangeContractedWorkPaymentStatusApprovedForm";

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const AdminContractedWorkPaymentModal = (props) => {
  return (
    <>
      <AdminChangeContractedWorkPaymentStatusApprovedForm
        contractedWork={props.contractedWork}
        isAdminView={true}
      />
      <div className="right">
        <Button type="primary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </>
  );
};

AdminContractedWorkPaymentModal.propTypes = propTypes;

export default AdminContractedWorkPaymentModal;
