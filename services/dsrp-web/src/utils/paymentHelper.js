import { CONTRACTED_WORK_PAYMENT_STATUS, PAYMENT_TYPES } from "@/constants/payments";

export const firstPercent = 10;
export const finalPercent = 30;
export const interimPercent = 60;

export const getTypeEstSharedCost = (percent, estSharedCost) => estSharedCost * (percent / 100);

export const getFirstSharedCost = (estimatedSharedCost) =>
  parseFloat(getTypeEstSharedCost(firstPercent, estimatedSharedCost));

export const getInterimSharedCost = (estimatedSharedCost) =>
  parseFloat(getTypeEstSharedCost(interimPercent, estimatedSharedCost));

export const getFinalSharedCost = (estimatedSharedCost) =>
  parseFloat(getTypeEstSharedCost(finalPercent, estimatedSharedCost));

export const calculateInterimFinancialContribution = (contractedWork, actualCost = null) => {
  const contractedWorkPayment = contractedWork.contracted_work_payment;
  const interimEstSharedCost = getInterimSharedCost(contractedWork.estimated_shared_cost);
  const interimEocTotalAmount =
    actualCost ??
    (contractedWorkPayment && contractedWorkPayment.interim_actual_cost
      ? parseFloat(contractedWorkPayment.interim_actual_cost)
      : 0);

  const interimMaximumReceivablePayment = interimEstSharedCost;
  const interimEstimatedFinancialContribution = Math.min(
    interimEstSharedCost,
    interimEocTotalAmount / 2
  );

  return {
    maxAmount: parseFloat(interimMaximumReceivablePayment),
    estimatedFinancialContribution: parseFloat(interimEstimatedFinancialContribution) ?? 0,
  };
};

export const calculateFinalFinancialContribution = (contractedWork, actualCost = null) => {
  const contractedWorkPayment = contractedWork.contracted_work_payment;
  const interimEstSharedCost = getInterimSharedCost(contractedWork.estimated_shared_cost);

  const finalEstSharedCost = getFinalSharedCost(contractedWork.estimated_shared_cost);
  const finalActualCost =
    actualCost ??
    (contractedWorkPayment && contractedWorkPayment.final_actual_cost
      ? parseFloat(contractedWorkPayment.final_actual_cost)
      : 0);

  const interimEstimatedPayment =
    contractedWorkPayment &&
    contractedWorkPayment.interim_payment_status_code === CONTRACTED_WORK_PAYMENT_STATUS.APPROVED
      ? contractedWorkPayment.interim_paid_amount ?? 0
      : interimEstSharedCost;

  const finalHalfEocTotal = finalActualCost ? finalActualCost / 2 : 0;
  const finalMaximumReceivablePayment =
    finalEstSharedCost + (interimEstSharedCost - interimEstimatedPayment);
  const finalEstimatedFinancialContribution = Math.min(
    finalMaximumReceivablePayment,
    finalHalfEocTotal
  );

  return {
    maxAmount: parseFloat(finalMaximumReceivablePayment) ?? 0,
    estimatedFinancialContribution: parseFloat(finalEstimatedFinancialContribution) ?? 0,
  };
};

export const calculateEstimatedFinancialContribution = (
  paymentType,
  contractedWork,
  actualCost = null
) => {
  switch (paymentType) {
    case PAYMENT_TYPES.INTERIM:
      return calculateInterimFinancialContribution(contractedWork, actualCost);
    case PAYMENT_TYPES.FINAL:
      return calculateFinalFinancialContribution(contractedWork, actualCost);
    default:
      return { maxAmount: 0, estimatedFinancialContribution: 0 };
  }
};
