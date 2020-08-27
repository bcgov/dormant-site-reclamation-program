/* eslint-disable */
import * as staticContentReducer from "../reducers/staticContentReducer";
import { createSelector } from "reselect";
import {
  createLabelHash,
  createDropDownList,
  createFilterList,
  createDropDownListWithDescriptions,
} from "../utils/helpers";

export const {
  getStaticContentLoadingIsComplete,
  getApplicationStatusOptions,
  getApplicationDocumentTypeOptions,
  getContractedWorkStatusOptions,
  getContractedWorkPaymentStatusOptions,
  getContractedWorkTypeOptions,
} = staticContentReducer;

export const getDropdownApplicationStatusOptions = createSelector(
  [getApplicationStatusOptions],
  (options) =>
    createDropDownListWithDescriptions(
      options,
      "description",
      "application_status_code",
      "long_description"
    )
);

export const getFilterListApplicationStatusOptions = createSelector(
  [getApplicationStatusOptions],
  (options) => createFilterList(options, "description", "application_status_code")
);

export const getApplicationStatusOptionsHash = createSelector(
  [getDropdownApplicationStatusOptions],
  createLabelHash
);

export const getDropdownApplicationDocumentTypeOptions = createSelector(
  [getApplicationDocumentTypeOptions],
  (options) => createDropDownList(options, "description", "application_document_code")
);

export const getApplicationDocumentTypeOptionsHash = createSelector(
  [getDropdownApplicationDocumentTypeOptions],
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

export const getFilterListContractedWorkPaymentStatusOptions = createSelector(
  [getContractedWorkPaymentStatusOptions],
  (options) => createFilterList(options, "description", "contracted_work_payment_status_code")
);

export const getDropdownContractedWorkPaymentStatusOptions = createSelector(
  [getContractedWorkPaymentStatusOptions],
  (options) => createDropDownList(options, "description", "contracted_work_payment_status_code")
);

export const getContractedWorkPaymentStatusOptionsHash = createSelector(
  [getDropdownContractedWorkPaymentStatusOptions],
  createLabelHash
);

export const getDropdownContractedWorkTypeOptions = createSelector(
  [getContractedWorkTypeOptions],
  (options) => createDropDownList(options, "description", "contracted_work_code")
);

export const getContractedWorkTypeOptionsHash = createSelector(
  [getDropdownContractedWorkTypeOptions],
  createLabelHash
);

export const getFilterListContractedWorkTypeOptions = createSelector(
  [getContractedWorkTypeOptions],
  (options) => createFilterList(options, "description", "contracted_work_code")
);
