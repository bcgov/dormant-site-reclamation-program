import * as CommonTypes from "@/customPropTypes/common";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as PaymentDocuments from "@/customPropTypes/paymentDocuments";

export default {
  ...DocumentTypes,
  ...CommonTypes,
  ...PaymentDocuments,
};
