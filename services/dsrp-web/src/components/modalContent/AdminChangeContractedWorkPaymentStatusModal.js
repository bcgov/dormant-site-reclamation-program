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

  const getInitialApprovedAmount = () => {
    const getTypeEstSharedCost = (percent, estSharedCost) => estSharedCost * (percent / 100);
    const getTypeMaxEligibleAmount = (eocTotalAmount) => eocTotalAmount * 0.5;

    const interimPercent = 60;
    const finalPercent = 30;

    const contractedWork = props.contractedWork;
    const contractedWorkPayment = contractedWork.contracted_work_payment;

    // Interim payment calculations
    const interimEstSharedCost = parseFloat(
      getTypeEstSharedCost(interimPercent, contractedWork.estimated_shared_cost)
    );
    const currentInterimApprovedAmount = contractedWorkPayment.interim_paid_amount
      ? parseFloat(contractedWorkPayment.interim_paid_amount)
      : 0;
    const interimActualCost = contractedWorkPayment.interim_actual_cost
      ? parseFloat(contractedWorkPayment.interim_actual_cost)
      : 0;
    const interimHalfEocTotal = interimActualCost ? getTypeMaxEligibleAmount(interimActualCost) : 0;
    const interimLostFunds = interimEstSharedCost - currentInterimApprovedAmount;

    // Final payment calculations
    const finalEstSharedCost = parseFloat(
      getTypeEstSharedCost(finalPercent, contractedWork.estimated_shared_cost)
    );
    const finalActualCost = contractedWorkPayment.final_actual_cost
      ? parseFloat(contractedWorkPayment.final_actual_cost)
      : 0;
    const finalHalfEocTotal = finalActualCost ? getTypeMaxEligibleAmount(finalActualCost) : 0;
    const finalEligibleAmount = finalEstSharedCost + interimLostFunds;

    // Determine the appropriate initial approved amount
    let initialApprovedAmount = null;
    if (props.contractedWorkPaymentType === "INTERIM") {
      initialApprovedAmount = Math.min(interimEstSharedCost, interimHalfEocTotal);
    } else if (props.contractedWorkPaymentType === "FINAL") {
      initialApprovedAmount = Math.min(finalEligibleAmount, finalHalfEocTotal);
    } else {
      throw new Error("Unknown contracted work payment code received!");
    }

    return initialApprovedAmount;
  };

  const initialValues = { approved_amount: getInitialApprovedAmount() };

  return (
    <AdminChangeContractedWorkPaymentStatusForm
      onSubmit={handleSubmit}
      contractedWork={props.contractedWork}
      contractedWorkPaymentStatus={props.contractedWorkPaymentStatus}
      contractedWorkPaymentType={props.contractedWorkPaymentType}
      contractedWorkPaymentStatusOptionsHash={props.contractedWorkPaymentStatusOptionsHash}
      initialValues={initialValues}
      closeModal={props.closeModal}
    />
  );
};

AdminChangeContractedWorkPaymentStatusModal.propTypes = propTypes;

export default AdminChangeContractedWorkPaymentStatusModal;
