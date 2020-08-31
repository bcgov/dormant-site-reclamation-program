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
    .post(ENVIRONMENT.apiUrl + API.AUTHORIZE_OTP, { application_guid }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_OTL));
      notification.success({
        message: "One time password has been sent to your email. Please check",
        duration: 10,
      });
      // localStorage.setItem("jwt", response.data.access_token);
      return response;
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_OTL));
    });
};

export const exchangeOTLForOTP = (otl_guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_OTP));
  return axios
    .put(ENVIRONMENT.apiUrl + API.AUTHORIZE_OTP, { otl_guid }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_OTP));
      console.log(response);
      localStorage.setItem("otp", response.data.otp);
      return response.data;
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_OTP));
    });
};
