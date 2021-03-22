import { createSelector } from "reselect";
import { createLabelHash, createDropDownList } from "../utils/helpers";
import * as CPIReducer from "../reducers/CPIReducer";

export const {
  getCompanyPaymentInfos,
  getSelectedCompanyPaymentInfos,
} = CPIReducer;
