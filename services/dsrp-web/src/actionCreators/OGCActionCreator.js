import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as OGCActions from "../actions/OGCActions";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import CustomAxios from "../customAxios";

export const fetchPermitHolders = () => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_PERMIT_HOLDERS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.PERMIT_HOLDER(), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_PERMIT_HOLDERS));
      dispatch(OGCActions.storePermitHolders(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_PERMIT_HOLDERS)));
};

export const fetchWells = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_WELLS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.WELL(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_WELLS));
      dispatch(OGCActions.storeWells(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_WELLS)));
};

export const fetchSelectedWell = (params = {}) => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_SELECTED_WELL));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.WELL(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_SELECTED_WELL));
      if (response.data.records.length > 0)
        dispatch(OGCActions.storeSelectedWell(response.data.records[0]));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_SELECTED_WELL)));
};

export const fetchLiabilities = (guid = "") => (dispatch) => {
  dispatch(request(reducerTypes.FETCH_LIABILITIES));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.LIABILITY(guid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_LIABILITIES));
      dispatch(OGCActions.storeLiabilities(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.FETCH_LIABILITIES)));
};

export const validateWell = (params = {}) =>
  CustomAxios().get(ENVIRONMENT.apiUrl + API.WELL(params), createRequestHeader());
