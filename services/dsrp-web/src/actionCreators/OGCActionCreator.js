import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as OGCActions from "../actions/OGCActions";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import CustomAxios from "../customAxios";

export const fetchPermitHolders = () => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PERMIT_HOLDERS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.PERMIT_HOLDER(), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PERMIT_HOLDERS));
      dispatch(OGCActions.storePermitHolders(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_PERMIT_HOLDERS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchWells = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_WELLS));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.WELL(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_WELLS));
      dispatch(OGCActions.storeWells(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_WELLS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchLiabilities = () => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_LIABILITIES));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.LIABILITY(), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_LIABILITIES));
      dispatch(OGCActions.storeLiabilities(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_LIABILITIES)))
    .finally(() => dispatch(hideLoading()));
};
