import { notification } from "antd";
import { hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as applicationActions from "@/actions/applicationActions";
import CustomAxios from "../customAxios";

export const uploadDocuments = (application) => (dispatch) => {
  //   dispatch(request(reducerTypes.CREATE_APPLICATION));
  //   const payload = { application };
  //   return CustomAxios()
  //     .post(ENVIRONMENT.apiUrl + API.APPLICATION() + payload, createRequestHeader())
  //     .then((response) => {
  //       notification.success({
  //         message: `Application submitted`,
  //         duration: 10,
  //       });
  //       dispatch(success(reducerTypes.CREATE_APPLICATION));
  //       return response;
  //     })
  //     .catch((error) => {
  //       dispatch(error(reducerTypes.CREATE_APPLICATION));
  //       throw new Error(error);
  //     });
};
