import { notification } from "antd";
import { hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as appSettingActions from "@/actions/appSettingActions";
import CustomAxios from "../customAxios";

export const updateAppSetting = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APP_SETTING));
  return CustomAxios()
    .put(`${ENVIRONMENT.apiUrl + API.APP_SETTINGS}`, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: `Successfully ${
          response.data.setting_value ? "disabled" : "enabled"
        } application submissions`,
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_APP_SETTING));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_APP_SETTING)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchAppSettings = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_APP_SETTINGS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APP_SETTINGS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APP_SETTINGS));
      dispatch(appSettingActions.storeAppSettings(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_APP_SETTINGS)))
    .finally(() => dispatch(hideLoading()));
};
