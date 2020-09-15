import ApplicationStatusModal from "@/components/modalContent/ApplicationStatusModal";
import AdminEditApplicationModal from "@/components/modalContent/AdminEditApplicationModal";
import AdminReviewContractedWorkPaymentModal from "@/components/modalContent/AdminReviewContractedWorkPaymentModal";
import AdminCreatePaymentRequestFormModal from "@/components/modalContent/AdminCreatePaymentRequestFormModal";
import ContractedWorkPaymentModal from "@/components/modalContent/ContractedWorkPaymentModal";

export const modalConfig = {
  UPDATE_APPLICATION_STATUS: ApplicationStatusModal,
  ADMIN_EDIT_APPLICATION: AdminEditApplicationModal,
  ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT: AdminReviewContractedWorkPaymentModal,
  ADMIN_CREATE_PRF: AdminCreatePaymentRequestFormModal,
  CONTRACTED_WORK_PAYMENT: ContractedWorkPaymentModal,
};

export default modalConfig;
