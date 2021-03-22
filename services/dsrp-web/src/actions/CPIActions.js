import * as ActionTypes from "../constants/actionTypes";

export const storeCompanyPaymentInfo = (payload) => ({
    type: ActionTypes.STORE_COMPANY_PAYMENT_INFO,
    payload,
  });

export const storeSelectedCompanyPaymentInfo = (payload) => ({
    type: ActionTypes.STORE_SELECTED_COMPANY_PAYMENT_INFO,
    payload,
  });
