import { startCase, camelCase } from "lodash";
import { createSelector } from "reselect";
import * as applicationReducer from "../reducers/applicationReducer";

export const { getApplications, getApplication, getPageData } = applicationReducer;

// return an array of contracted_work on well sites
export const getWorkTypes = createSelector([getApplications], (applications) => {
  const wellArray = [];
  applications.map((application) => {
    if (application.json.well_sites) {
      application.json.well_sites.map((site) => {
        const contractedWork = Object.keys(site.contracted_work);
        if (contractedWork.length >= 1) {
          contractedWork.map((work) => {
            const priorityCriteria = Object.values(site.site_conditions).length;
            const estimatedCostArray = Object.values(site.contracted_work[work]).filter(
              (v) => !isNaN(v)
            );
            const estimatedCost = estimatedCostArray.reduce((sum, value) => +sum + +value, 0);
            const workTypes = {
              key: application.guid,
              well_no: site.details.well_authorization_number,
              work_type: startCase(camelCase(work)),
              priority_criteria: priorityCriteria,
              completion_date: site.contracted_work[work].work_end_date,
              est_cost: estimatedCost,
              est_shared_cost: "",
              LRM: "",
              status: "",
              OGC_status: "",
              location: "",
            };
            wellArray.push(workTypes);
          });
        }
      });
    }
  });
  return wellArray;
});
