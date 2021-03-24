import React from "react";
import PropTypes from "prop-types";
import AdminEditCompanyPaymentInfoStatusForm from "@/components/forms/AdminEditCompanyPaymentInfoForm";

const propTypes = {
};

export const AdminEditCompanyPaymentInfoModal = (props) => {
  return (
    <AdminEditCompanyPaymentInfoStatusForm
      onSubmit={props.onSubmit}
      companyPaymentInfo={props.cpi}
      closeModal={props.closeModal}
      isAdd={props.isAdd}
      initialValues={props.cpi}
    />
  );
};

AdminEditCompanyPaymentInfoModal.propTypes = propTypes;

export default AdminEditCompanyPaymentInfoModal;
