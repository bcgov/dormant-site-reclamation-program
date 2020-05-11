import { notification } from "antd";
import { hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

const handleError = (dispatch, reducer) => (err) => {
  notification.error({
    message: err.response ? err.response.data.message : String.ERROR,
    duration: 10,
  });
  dispatch(error(reducer));
  dispatch(hideLoading("modal"));
};

export const createSubmission = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_SUBMISSION));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.SUBMISSION_URL, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Submission successful`,
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_SUBMISSION));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_SUBMISSION)))
    .finally(() => dispatch(hideLoading("modal")));
};
