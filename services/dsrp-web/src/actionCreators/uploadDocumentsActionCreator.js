import { notification } from "antd";
import { hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as applicationActions from "@/actions/applicationActions";
import CustomAxios from "../customAxios";

export const uploadDocs = (guid, documents) => (dispatch) => {
  dispatch(request(reducerTypes.UPLOAD_DOCUMENTS));
  const payload = { documents };
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.APPLICATION_DOCUMENT(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Documents successfully submitted.`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPLOAD_DOCUMENTS));
      return response;
    })
    .catch((error) => {
      dispatch(error(reducerTypes.UPLOAD_DOCUMENTS));
      throw new Error(error);
    });
};
