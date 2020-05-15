import * as ActionTypes from "../constants/actionTypes";

export const storePermitHolders = (payload) => ({
  type: ActionTypes.STORE_PERMIT_HOLDERS,
  payload,
});

export const storeWells = (payload) => ({
  type: ActionTypes.STORE_WELLS,
  payload,
});

export const storeSelectedWell = (payload) => ({
  type: ActionTypes.STORE_SELECTED_WELL,
  payload,
});

export const storeLiabilities = (payload) => ({
  type: ActionTypes.STORE_LIABILITIES,
  payload,
});
