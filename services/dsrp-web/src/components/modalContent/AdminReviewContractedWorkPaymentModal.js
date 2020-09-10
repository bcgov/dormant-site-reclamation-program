import React from "react";
import PropTypes from "prop-types";
import AdminChangeContractedWorkPaymentStatusForm from "@/components/forms/AdminChangeContractedWorkPaymentStatusForm";

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const AdminReviewContractedWorkPaymentModal = (props) => {
  const handleSubmit = (values) =>
    props.onSubmit(props.contractedWork, {
      contracted_work_payment_status_code: props.contractedWorkPaymentStatus,
      contracted_work_payment_code: props.contractedWorkPaymentType,
      ...values,
    });

  const getInitialApprovedAmount = (contractedWorkPaymentType) => {
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
    if (contractedWorkPaymentType === "INTERIM") {
      initialApprovedAmount = Math.min(interimEstSharedCost, interimHalfEocTotal);
    } else if (contractedWorkPaymentType === "FINAL") {
      initialApprovedAmount = Math.min(finalEligibleAmount, finalHalfEocTotal);
    } else {
      throw new Error("Unknown contracted work payment code received!");
    }

    return initialApprovedAmount;
  };

  const initialValues = {
    interim_initial_approved_amount: getInitialApprovedAmount("INTERIM"),
    final_initial_approved_amount: getInitialApprovedAmount("FINAL"),
  };

  return (
    <AdminChangeContractedWorkPaymentStatusForm
      onSubmit={handleSubmit}
      contractedWork={props.contractedWork}
      contractedWorkPaymentStatusOptionsHash={props.contractedWorkPaymentStatusOptionsHash}
      initialValues={initialValues}
      closeModal={props.closeModal}
    />
  );
};

AdminReviewContractedWorkPaymentModal.propTypes = propTypes;

export default AdminReviewContractedWorkPaymentModal;
