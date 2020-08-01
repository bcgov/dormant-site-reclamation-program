import { notification } from "antd";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import CustomAxios from "../customAxios";

// eslint-disable-next-line import/prefer-default-export
export const uploadDocs = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPLOAD_DOCUMENTS));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.APPLICATION_DOCUMENT(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully submitted documents",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPLOAD_DOCUMENTS));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPLOAD_DOCUMENTS));
      throw new Error(err);
    });
};
