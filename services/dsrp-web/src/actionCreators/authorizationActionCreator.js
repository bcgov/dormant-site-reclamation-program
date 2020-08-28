import axios from "axios";
import { notification } from "antd";
import queryString from "query-string";
import jwt from "jsonwebtoken";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import * as API from "@/constants/api";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";

export const createOTL = (application_guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_OTL));
  return axios
    .post(ENVIRONMENT.apiUrl + API.AUTHORIZE_OTP, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_OTL));
      // localStorage.setItem("jwt", response.data.access_token);
      return response;
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_OTL));
      dispatch(unAuthenticateUser());
    });
};

export const exchangeOTLForOTP = (otl_guid) => (dispatch) => {
  dispatch(request(reducerTypes.AUTHENTICATE_USER));
  return axios
    .post(ENVIRONMENT.apiUrl + API.APP_SETTINGS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.AUTHENTICATE_USER));
      // localStorage.setItem("jwt", response.data.access_token);
      return response;
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.AUTHENTICATE_USER));
      dispatch(unAuthenticateUser());
    });
};
