/* eslint-disable */
import * as staticContentReducer from "../reducers/staticContentReducer";
import { createSelector } from "reselect";
import { createLabelHash, createDropDownList } from "../utils/helpers";

export const {
  getStaticContentLoadingIsComplete,
  getApplicationStatusOptions,
  getContractedWorkStatusOptions,
} = staticContentReducer;

export const getDropdownApplicationStatusOptions = createSelector(
  [getApplicationStatusOptions],
  (options) => createDropDownList(options, "description", "application_status_code")
);

export const getApplicationStatusOptionsHash = createSelector(
  [getDropdownApplicationStatusOptions],
  createLabelHash
);

export const getDropdownContractedWorkStatusOptions = createSelector(
  [getContractedWorkStatusOptions],
  (options) => createDropDownList(options, "description", "contracted_work_status_code")
);

export const getContractedWorkStatusOptionsHash = createSelector(
  [getDropdownContractedWorkStatusOptions],
  createLabelHash
);
