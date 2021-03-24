import ApplicationStatusModal from "@/components/modalContent/ApplicationStatusModal";
import AdminEditApplicationModal from "@/components/modalContent/AdminEditApplicationModal";
import AdminReviewContractedWorkPaymentModal from "@/components/modalContent/AdminReviewContractedWorkPaymentModal";
import AdminCreatePaymentRequestFormModal from "@/components/modalContent/AdminCreatePaymentRequestFormModal";
import ContractedWorkPaymentModal from "@/components/modalContent/ContractedWorkPaymentModal";
import AdminEditCompanyPaymentInfoModal from "@/components/modalContent/AdminEditCompanyPaymentInfoModal";
// import AdminAddCompanyPaymentInfoModal from "@/components/modalContent/AdminAddCompanyPaymentInfoModal";

export const modalConfig = {
  UPDATE_APPLICATION_STATUS: ApplicationStatusModal,
  ADMIN_EDIT_APPLICATION: AdminEditApplicationModal,
  ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT: AdminReviewContractedWorkPaymentModal,
  ADMIN_CREATE_PRF: AdminCreatePaymentRequestFormModal,
  CONTRACTED_WORK_PAYMENT: ContractedWorkPaymentModal,
  ADMIN_EDIT_COMPANY_PAYMENT_INFO: AdminEditCompanyPaymentInfoModal,
  // ADMIN_ADD_COMPANY_PAYMENT_INFO: AdminAddCompanyPaymentInfoModal,
};

export default modalConfig;
