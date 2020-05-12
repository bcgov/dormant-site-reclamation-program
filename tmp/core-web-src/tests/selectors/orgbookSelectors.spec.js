import { getSearchOrgBookResults, getOrgBookCredential } from "@/selectors/orgbookSelectors";
import { orgbookReducer } from "@/reducers/orgbookReducer";
import { storeSearchOrgBookResults, storeOrgBookCredential } from "@/actions/orgbookActions";
import { ORGBOOK } from "@/constants/reducerTypes";
import * as MOCK from "@/tests/mocks/dataMocks";

describe("getSearchOrgBookResults", () => {
  it("`getSearchOrgBookResults` calls `orgbookReducer.getSearchOrgBookResults`", () => {
    const storeAction = storeSearchOrgBookResults(MOCK.ORGBOOK_SEARCH_RESULTS);
    const storeState = orgbookReducer({}, storeAction);
    const mockState = {
      [ORGBOOK]: storeState,
    };

    expect(getSearchOrgBookResults(mockState)).toEqual(MOCK.ORGBOOK_SEARCH_RESULTS);
  });

  it("`getOrgBookCredential` calls `orgbookReducer.getOrgBookCredential`", () => {
    const storeAction = storeOrgBookCredential(MOCK.ORGBOOK_CREDENTIAL);
    const storeState = orgbookReducer({}, storeAction);
    const mockState = {
      [ORGBOOK]: storeState,
    };

    expect(getOrgBookCredential(mockState)).toEqual(MOCK.ORGBOOK_CREDENTIAL);
  });
});
