import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { paymentDocuments } from "@/customPropTypes/paymentDocuments";
import { PaymentDocumentTable } from "@/components/pages/PaymentDocumentTable";

const { Title } = Typography;

const propTypes = {
  application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(paymentDocuments),
};

const defaultProps = {
  documents: [],
};

// TODO declare separate table for payment requests with buttons
export const ViewPaymentRequestPage = (props) => {
  return (
    <>
      <Title level={3} className="documents-section">
        Payment Requests Forms
      </Title>
      <PaymentDocumentTable
        {...props}
        emptyText="This application does not contain any payment request documents."
        tableTitle="First Payment(s)"
      />
      <PaymentDocumentTable
        {...props}
        emptyText="This application does not contain any payment request documents."
        tableTitle="Interim Payment(s)"
      />
      <PaymentDocumentTable
        {...props}
        emptyText="This application does not contain any payment request documents."
        tableTitle="Final Payment(s)"
      />
    </>
  );
};

ViewPaymentRequestPage.propTypes = propTypes;
ViewPaymentRequestPage.defaultProps = defaultProps;

export default ViewPaymentRequestPage;
