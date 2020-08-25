import { reduxForm } from "redux-form";
import * as FORM from "@/constants/forms";
import { ContractedWorkPaymentForm } from "@/components/forms/ContractedWorkPaymentForm";

class FinalContractedWorkPaymentForm extends ContractedWorkPaymentForm {}

export default reduxForm({
  form: FORM.CONTRACTED_WORK_FINAL_PAYMENT_FORM,
  enableReinitialize: true,
})(FinalContractedWorkPaymentForm);
