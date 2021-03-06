import {
  startCase,
  camelCase,
  isObjectLike,
  isEmpty,
  isArrayLike,
  sum,
  get,
  startsWith,
  endsWith,
  flatten,
} from "lodash";
import { createSelector } from "reselect";
import * as applicationReducer from "../reducers/applicationReducer";
import { getWells, getLiabilities, getNominatedWells } from "@/selectors/OGCSelectors";
import { contractedWorkIdSorter } from "@/utils/helpers";
import { APPLICATION_PHASE_CODES } from "@/constants/strings";
import CONTRACT_WORK_SECTIONS from "@/constants/contract_work_sections";

export const {
  getApplications,
  getApplication,
  getApplicationApprovedContractedWork,
  getApplicationsApprovedContractedWork,
  getPageData,
} = applicationReducer;

const getLMR = (workType, liability) => {
  if (!liability) {
    return null;
  }
  if (startsWith(workType, "abandonment")) {
    return liability.abandonment_liability;
  }
  if (endsWith(workType, "investigation")) {
    return liability.assessment_liability;
  }
  if (startsWith(workType, "reclamation")) {
    return liability.reclamation_liability;
  }
  if (startsWith(workType, "remediation")) {
    return liability.remediation_liability;
  }
};
// return an array of contracted_work on well sites
export const getApplicationsWellSitesContractedWork = createSelector(
  [getApplications, getWells, getLiabilities, getNominatedWells],
  (applications, wells, liabilities, nominatedWells) => {
    if (isEmpty(applications) || !isArrayLike(applications)) {
      return [];
    }

    let wellSitesContractedWork = [];
    applications.map((application) => {
      if (isEmpty(application) || isEmpty(application.json)) {
        return;
      }

      const filteredWells =
        application.application_phase_code === APPLICATION_PHASE_CODES.INITIAL
          ? wells
          : nominatedWells;

      const wellSites = application.json.well_sites;
      if (isEmpty(wellSites) || !isArrayLike(wellSites)) {
        return;
      }

      const reviewJson = (isObjectLike(application.review_json) && application.review_json) || null;
      const estimatedCostOverrides =
        (isObjectLike(application.estimated_cost_overrides) &&
          application.estimated_cost_overrides) ||
        null;

      wellSites.map((site, index) => {
        if (isEmpty(site)) {
          return;
        }

        const wellAuthorizationNumber =
          (isObjectLike(site.details) && site.details.well_authorization_number) || null;

        const priorityCriteria =
          (isObjectLike(site.site_conditions) && Object.values(site.site_conditions).length) || 0;

        const reviewJsonWellSite =
          (reviewJson &&
            wellAuthorizationNumber &&
            isArrayLike(reviewJson.well_sites) &&
            isObjectLike(reviewJson.well_sites[index]) &&
            reviewJson.well_sites[index][wellAuthorizationNumber]) ||
          null;

        const contractedWork = (isObjectLike(site.contracted_work) && site.contracted_work) || {};
        Object.keys(contractedWork).map((type) => {
          const amountFields = flatten(
            CONTRACT_WORK_SECTIONS.find(
              (cws) => cws.formSectionName === type
            ).subSections.map((ss) => ss.amountFields.map((af) => af.fieldName))
          );
          let estimatedCostArray = [];
          amountFields.map((field) => {
            if (field in contractedWork[type]) {
              estimatedCostArray.push(contractedWork[type][field]);
            }
          });

          const contractedWorkStatusCode = get(
            reviewJsonWellSite,
            `contracted_work.${type}.contracted_work_status_code`,
            null
          );

          const maxSharedCost = 100000;
          const shouldSharedCostBeZero = !(contractedWorkStatusCode === "APPROVED");
          const workId = contractedWork[type].work_id;

          const estimatedCostOverride =
            estimatedCostOverrides && workId in estimatedCostOverrides
              ? estimatedCostOverrides[workId]
              : null;
          const calculatedSharedCostOverride =
            estimatedCostOverride !== null ? (estimatedCostOverride / 2).toFixed(2) : null;
          const sharedCostOverride =
            calculatedSharedCostOverride > maxSharedCost
              ? maxSharedCost
              : calculatedSharedCostOverride;
          const sharedCostOverrideByStatus = shouldSharedCostBeZero ? 0 : sharedCostOverride;

          const calculatedSharedCost = (sum(estimatedCostArray) / 2).toFixed(2);
          const sharedCost =
            calculatedSharedCost > maxSharedCost ? maxSharedCost : calculatedSharedCost;
          const sharedCostByStatus = shouldSharedCostBeZero ? 0 : sharedCost;

          const OGCStatus = !isEmpty(filteredWells[wellAuthorizationNumber])
            ? filteredWells[wellAuthorizationNumber].current_status
            : null;
          const location = !isEmpty(filteredWells[wellAuthorizationNumber])
            ? filteredWells[wellAuthorizationNumber].surface_location
            : null;
          const liability = !isEmpty(liabilities[wellAuthorizationNumber])
            ? liabilities[wellAuthorizationNumber]
            : null;
          const wellSiteContractedWorkType = {
            key: `${application.guid}.${wellAuthorizationNumber}.${type}`,
            well_index: index,
            application_guid: application.guid,
            work_id: workId,
            well_authorization_number: wellAuthorizationNumber,
            contracted_work_type: type,
            contracted_work_type_description: startCase(camelCase(type)),
            priority_criteria: priorityCriteria,
            completion_date: contractedWork[type].planned_end_date,
            est_cost: sum(estimatedCostArray),
            est_shared_cost: sharedCostByStatus,
            est_cost_override: estimatedCostOverride,
            est_shared_cost_override: sharedCostOverrideByStatus,
            LMR: getLMR(type, liability),
            OGC_status: OGCStatus,
            location,
            contracted_work_status_code: contractedWorkStatusCode || "NOT_STARTED",
            review_json: reviewJson,
          };

          wellSitesContractedWork.push(wellSiteContractedWorkType);
        });
      });
    });
    wellSitesContractedWork = wellSitesContractedWork.sort(contractedWorkIdSorter);
    return wellSitesContractedWork;
  }
);
