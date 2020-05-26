import { notification } from "antd";
import { hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as applicationActions from "@/actions/applicationActions";
import CustomAxios from "../customAxios";

export const createApplication = (application) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_APPLICATION));
  const payload = { application };
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.APPLICATION(), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Application submitted`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_APPLICATION));
      throw new Error(err);
    });
};

export const fetchApplications = (params) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATIONS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATIONS));
      dispatch(applicationActions.storeApplications(response.data));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.GET_APPLICATIONS));
      throw new Error(error);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchApplicationById = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION_BY_ID(guid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION));
      dispatch(applicationActions.storeApplication(response.data));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.GET_APPLICATION));
      throw new Error(error);
    })
    .finally(() => dispatch(hideLoading()));
};

export const fetchApplicationSummaryById = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION_SUMMARY));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION_SUMMARY_BY_ID(guid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION_SUMMARY));
      dispatch(applicationActions.storeApplication(response.data));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.GET_APPLICATION_SUMMARY));
      throw new Error(error);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateApplication = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APPLICATION));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.APPLICATION_BY_ID(guid), payload, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.UPDATE_APPLICATION));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.UPDATE_APPLICATION));
      throw new Error(error);
    })
    .finally(() => dispatch(hideLoading()));
};

export const updateApplicationReview = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APPLICATION_REVIEW));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.APPLICATION_REVIEW(guid), payload, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.UPDATE_APPLICATION_REVIEW));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.UPDATE_APPLICATION_REVIEW));
      throw new Error(error);
    })
    .finally(() => dispatch(hideLoading()));
};

export const createApplicationStatus = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_APPLICATION_STATUS));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.STATUS(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Sucessfully updated status of the application and informed applicant via email`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_APPLICATION_STATUS));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_APPLICATION_STATUS));
      throw new Error(err);
    });
};
