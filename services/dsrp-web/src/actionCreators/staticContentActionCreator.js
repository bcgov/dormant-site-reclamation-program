import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as staticContentActions from "../actions/staticContentActions";
import * as String from "../constants/strings";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import CustomAxios from "../customAxios";

export const loadBulkStaticContent = () => (dispatch) => {
  dispatch(request(reducerTypes.LOAD_ALL_STATIC_CONTENT));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.STATIC_CONTENT, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.LOAD_ALL_STATIC_CONTENT));
      dispatch(staticContentActions.storeBulkStaticContent(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.LOAD_ALL_STATIC_CONTENT)));
};
