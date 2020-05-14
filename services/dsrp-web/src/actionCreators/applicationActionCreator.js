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
    .post(ENVIRONMENT.apiUrl + API.APPLICATION, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Application submitted`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_APPLICATION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_APPLICATION)));
};

export const fetchApplications = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATIONS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATIONS));
      dispatch(applicationActions.storeApplications(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_APPLICATIONS)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchApplication = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION + "/" + guid, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION));
      dispatch(applicationActions.storeApplication(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_APPLICATION)))
    .finally(() => dispatch(hideLoading()));
};
