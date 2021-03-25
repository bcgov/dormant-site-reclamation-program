import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as CPIActions from "../actions/CPIActions";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import CustomAxios from "../customAxios";

export const fetchCompanyPaymentInfos = (params = {}) => (dispatch) => {
    dispatch(request(reducerTypes.FETCH_COMPANY_PAYMENT_INFOS));
    return CustomAxios()
      .get(ENVIRONMENT.apiUrl + API.GET_COMPANY_PAYMENT_INFO(params), createRequestHeader())
      .then((response) => {
        dispatch(success(reducerTypes.FETCH_COMPANY_PAYMENT_INFOS));
        dispatch(CPIActions.storeCompanyPaymentInfo(response.data));
      })
      .catch(() => dispatch(error(reducerTypes.FETCH_COMPANY_PAYMENT_INFOS)));
  };

export const fetchSelectedCompanyPaymentInfo = (params = {}) => (dispatch) => {
    dispatch(request(reducerTypes.FETCH_SELECTED_COMPANY_PAYMENT_INFO));
    return CustomAxios()
      .get(ENVIRONMENT.apiUrl + API.GET_COMPANY_PAYMENT_INFO(params), createRequestHeader())
      .then((response) => {
        dispatch(success(reducerTypes.FETCH_SELECTED_COMPANY_PAYMENT_INFO));
        dispatch(CPIActions.storeCompanyPaymentInfo(response.data));
      })
      .catch(() => dispatch(error(reducerTypes.FETCH_SELECTED_COMPANY_PAYMENT_INFO)));
  };

export const updateCompanyPaymentInfo = (company_name, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_COMPANY_PAYMENT_INFO));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.UPDATE_COMPANY_PAYMENT_INFO(company_name), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Company payment info edited successfully",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_COMPANY_PAYMENT_INFO));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_COMPANY_PAYMENT_INFO)));
};

export const createCompanyPaymentInfo = (cpi) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_COMPANY_PAYMENT_INFO));
  const payload = { cpi };
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.CREATE_COMPANY_PAYMENT_INFO(), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Company payment info submitted",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_COMPANY_PAYMENT_INFO));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_COMPANY_PAYMENT_INFO)));
};
