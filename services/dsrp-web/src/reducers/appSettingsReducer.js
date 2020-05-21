import * as actionTypes from "../constants/actionTypes";
import { APP_SETTINGS } from "../constants/reducerTypes";

const initialState = {
  app_settings: [],
};

export const appSettingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_APP_SETTINGS:
      return {
        ...state,
        app_settings: action.payload.settings,
      };
    default:
      return state;
  }
};

const appSettingsReducerObject = {
  [APP_SETTINGS]: appSettingsReducer,
};

export const getAppSettings = (state) => state[APP_SETTINGS].app_settings;

export default appSettingsReducerObject;
