import { createSelector } from "reselect";
import { createLabelHash, createDropDownList } from "../utils/helpers";
import * as OGCReducer from "../reducers/OGCReducer";

export const { getPermitHolders, getLiabilities, getWells, getSelectedWells } = OGCReducer;

export const getPermitHoldersDropdown = createSelector([getPermitHolders], (options) =>
  createDropDownList(options, "organization_name", "operator_id")
);

export const getPermitHoldersHash = createSelector([getPermitHolders], createLabelHash);
