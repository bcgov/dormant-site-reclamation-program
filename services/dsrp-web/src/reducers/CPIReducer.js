import * as actionTypes from "../constants/actionTypes";
import { CPI } from "../constants/reducerTypes";

const initialState = {
  companyPaymentInfos: [],
  selectedCompanyPaymentInfos: [],
};

export const CPIReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_COMPANY_PAYMENT_INFO:
        return {
            ...state,
            companyPaymentInfos: action.payload.records,
        };
    case actionTypes.STORE_SELECTED_COMPANY_PAYMENT_INFO:
        return {
            ...state,
            selectedCompanyPaymentInfos: {
                ...state.selectedCompanyPaymentInfos,
                [action.payload.company_name]: { ...action.payload },
            },
        };
    default:
        return state;
    }
  };
  
  const createItemMap = (array, idField, currentState) => {
    const mapping = { ...currentState };
    array.forEach((item) => {
      mapping[item[idField]] = item;
    });
    return mapping;
  };
  
  const CPIReducerObject = {
    [CPI]: CPIReducer,
  };
  
  export const getCompanyPaymentInfos = (state) => state[CPI].companyPaymentInfos;
  export const getSelectedCompanyPaymentInfos = (state) => state[CPI].selectedCompanyPaymentInfos;
  
  export default CPIReducerObject;
