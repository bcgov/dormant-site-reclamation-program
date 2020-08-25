import ApplicationStatusModal from "@/components/modalContent/ApplicationStatusModal";
import AdminEditApplicationModal from "@/components/modalContent/AdminEditApplicationModal";
import ContractedWorkPaymentModal from "@/components/modalContent/ContractedWorkPaymentModal";

export const modalConfig = {
  UPDATE_APPLICATION_STATUS: ApplicationStatusModal,
  ADMIN_EDIT_APPLICATION: AdminEditApplicationModal,
  CONTRACTED_WORK_PAYMENT: ContractedWorkPaymentModal,
};

export default modalConfig;
