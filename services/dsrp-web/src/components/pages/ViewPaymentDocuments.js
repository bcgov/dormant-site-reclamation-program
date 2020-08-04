import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { paymentDocuments } from "@/customPropTypes/paymentDocuments";
import { PaymentDocumentTable } from "@/components/pages/PaymentDocumentTable";
import { PAYMENT_DOCUMENT_TYPES } from "@/constants/paymentDocumentTypes";

const { Title } = Typography;

const propTypes = {
  application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(paymentDocuments).isRequired,
};

export const ViewPaymentDocuments = (props) => {
  return (
    <>
      <Title level={3} className="documents-section">
        Payment Requests Forms
      </Title>
      <PaymentDocumentTable
        {...props}
        documents={props.documents.filter(
          (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.FIRST_PRF
        )}
        emptyText="This application does not contain any payment request documents."
        tableTitle="First Payment(s)"
      />
      <PaymentDocumentTable
        {...props}
        documents={props.documents.filter(
          (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.INTERIM_PRF
        )}
        emptyText="This application does not contain any interim payment request documents."
        tableTitle="Interim Payment(s)"
      />
      <PaymentDocumentTable
        {...props}
        documents={props.documents.filter(
          (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.FINAL_PRF
        )}
        emptyText="This application does not contain any final payment request documents."
        tableTitle="Final Payment(s)"
      />
    </>
  );
};

ViewPaymentDocuments.propTypes = propTypes;

export default ViewPaymentDocuments;
