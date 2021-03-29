import * as actionTypes from "../constants/actionTypes";
import { COMPANY_PAYMENT_INFO } from "../constants/reducerTypes";

const initialState = {
  companyPaymentInfos: [],
};

export const companyPaymentInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_COMPANY_PAYMENT_INFO:
        return {
          ...state,
          companyPaymentInfos: action.payload,
        };
    default:
        return state;
    }
  };
  
  const companyPaymentInfoReducerObject = {
    [COMPANY_PAYMENT_INFO]: companyPaymentInfoReducer,
  };
  
  export const getCompanyPaymentInfos = (state) => state[COMPANY_PAYMENT_INFO].companyPaymentInfos;
  
  export default companyPaymentInfoReducerObject;
