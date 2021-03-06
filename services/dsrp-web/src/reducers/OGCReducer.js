import * as actionTypes from "../constants/actionTypes";
import { OGC } from "../constants/reducerTypes";

const initialState = {
  permitHolders: [],
  wells: [],
  selectedWells: [],
  liabilities: [],
  nominatedWells: [],
  nominatedSelectedWells: [],
};

export const OGCReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMIT_HOLDERS:
      return {
        ...state,
        permitHolders: action.payload.records,
      };
    case actionTypes.STORE_WELLS:
      return {
        ...state,
        wells: createItemMap(action.payload.records, "well_auth_number", state.wells),
      };
    case actionTypes.STORE_SELECTED_WELL:
      return {
        ...state,
        selectedWells: {
          ...state.selectedWells,
          [action.payload.well_auth_number]: { ...action.payload },
        },
      };
    case actionTypes.STORE_NOMINATED_WELLS:
      return {
        ...state,
        nominatedWells: createItemMap(action.payload.records, "well_auth_number", state.wells),
      };
    case actionTypes.STORE_NOMINATED_SELECTED_WELL:
      return {
        ...state,
        nominatedSelectedWells: {
          ...state.nominatedSelectedWells,
          [action.payload.well_auth_number]: { ...action.payload },
        },
      };

    case actionTypes.STORE_LIABILITIES:
      return {
        ...state,
        liabilities: createItemMap(action.payload.records, "well_auth_number", state.liabilities),
      };
    default:
      return state;
  }
};

const createItemMap = (array, idField, currentState) => {
  const mapping = { ...currentState };
  array.forEach((item) => {
    mapping[item[idField]] = item;
  });
  return mapping;
};

const OGCReducerObject = {
  [OGC]: OGCReducer,
};

export const getPermitHolders = (state) => state[OGC].permitHolders;
export const getWells = (state) => state[OGC].wells;
export const getSelectedWells = (state) => state[OGC].selectedWells;
export const getNominatedWells = (state) => state[OGC].nominatedWells;
export const getNominatedSelectedWells = (state) => state[OGC].nominatedSelectedWells;
export const getLiabilities = (state) => state[OGC].liabilities;

export default OGCReducerObject;
