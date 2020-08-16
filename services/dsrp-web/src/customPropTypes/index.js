import * as CommonTypes from "@/customPropTypes/common";
import * as ApplicationTypes from "@/customPropTypes/application";
import * as DocumentTypes from "@/customPropTypes/documents";
import * as PaymentDocuments from "@/customPropTypes/paymentDocuments";

export default {
  ...CommonTypes,
  ...ApplicationTypes,
  ...DocumentTypes,
  ...PaymentDocuments,
};
