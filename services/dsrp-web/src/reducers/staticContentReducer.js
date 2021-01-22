import * as actionTypes from "../constants/actionTypes";
import { STATIC_CONTENT } from "../constants/reducerTypes";
import { CONTRACT_WORK_TYPE_OPTIONS } from "../constants/contract_work_sections";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled within this reducer.
 */

const initialState = {
  applicationStatusOptions: [],
  applicationDocumentTypeOptions: [],
  contractedWorkStatusOptions: [],
  contractedWorkPaymentStatusOptions: [],
  contractedWorkTypeOptions: CONTRACT_WORK_TYPE_OPTIONS,
  applicationPhaseTypeOptions: [],
};

export const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_BULK_STATIC_CONTENT:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const staticContentReducerObject = {
  [STATIC_CONTENT]: staticContentReducer,
};

export const getApplicationStatusOptions = (state) =>
  state[STATIC_CONTENT].applicationStatusOptions;
export const getApplicationDocumentTypeOptions = (state) =>
  state[STATIC_CONTENT].applicationDocumentTypeOptions;
export const getContractedWorkStatusOptions = (state) =>
  state[STATIC_CONTENT].contractedWorkStatusOptions;
export const getContractedWorkPaymentStatusOptions = (state) =>
  state[STATIC_CONTENT].contractedWorkPaymentStatusOptions;
export const getContractedWorkTypeOptions = (state) =>
  state[STATIC_CONTENT].contractedWorkTypeOptions;
export const getApplicationPhaseOptions = (state) =>
  state[STATIC_CONTENT].applicationPhaseTypeOptions;

const isStaticContentLoaded = (state) =>
  Object.keys(state)
    // eslint-disable-next-line no-prototype-builtins
    .filter((p) => state.hasOwnProperty(p) && Array.isArray(state[p]))
    .every((p) => state[p].length > 0);

export const getStaticContentLoadingIsComplete = (state) =>
  isStaticContentLoaded(state[STATIC_CONTENT]);

export default staticContentReducerObject;
