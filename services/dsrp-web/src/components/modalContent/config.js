import ApplicationStatusModal from "@/components/modalContent/ApplicationStatusModal";
import AdminEditApplicationModal from "@/components/modalContent/AdminEditApplicationModal";
import AdminOverrideEstimatedCostModal from "@/components/modalContent/AdminOverrideEstimatedCostModal";
import AdminReviewContractedWorkPaymentModal from "@/components/modalContent/AdminReviewContractedWorkPaymentModal";
import AdminCreatePaymentRequestFormModal from "@/components/modalContent/AdminCreatePaymentRequestFormModal";
import ContractedWorkPaymentModal from "@/components/modalContent/ContractedWorkPaymentModal";
import AdminEditCompanyPaymentInfoModal from "@/components/modalContent/AdminEditCompanyPaymentInfoModal";

export const modalConfig = {
  UPDATE_APPLICATION_STATUS: ApplicationStatusModal,
  ADMIN_EDIT_APPLICATION: AdminEditApplicationModal,
  ADMIN_OVERRIDE_ESTIMATED_COST: AdminOverrideEstimatedCostModal,
  ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT: AdminReviewContractedWorkPaymentModal,
  ADMIN_CREATE_PRF: AdminCreatePaymentRequestFormModal,
  CONTRACTED_WORK_PAYMENT: ContractedWorkPaymentModal,
  ADMIN_EDIT_COMPANY_PAYMENT_INFO: AdminEditCompanyPaymentInfoModal,
};

export default modalConfig;
