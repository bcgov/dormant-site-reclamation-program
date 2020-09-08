import ApplicationStatusModal from "@/components/modalContent/ApplicationStatusModal";
import AdminEditApplicationModal from "@/components/modalContent/AdminEditApplicationModal";
import AdminChangeContractedWorkPaymentStatusModal from "@/components/modalContent/AdminChangeContractedWorkPaymentStatusModal";
import AdminCreatePaymentRequestModal from "@/components/modalContent/AdminCreatePaymentRequestModal";
import ContractedWorkPaymentModal from "@/components/modalContent/ContractedWorkPaymentModal";
import AdminContractedWorkPaymentModal from "@/components/modalContent/AdminContractedWorkPaymentModal";

export const modalConfig = {
  UPDATE_APPLICATION_STATUS: ApplicationStatusModal,
  ADMIN_EDIT_APPLICATION: AdminEditApplicationModal,
  ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS: AdminChangeContractedWorkPaymentStatusModal,
  ADMIN_CREATE_PRF: AdminCreatePaymentRequestModal,
  CONTRACTED_WORK_PAYMENT: ContractedWorkPaymentModal,
  ADMIN_CONTRACTED_WORK_PAYMENT: AdminContractedWorkPaymentModal,
};

export default modalConfig;
