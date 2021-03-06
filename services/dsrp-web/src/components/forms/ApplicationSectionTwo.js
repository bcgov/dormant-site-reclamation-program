import React, { Component } from "react";
import { reduxForm, FieldArray, getFormValues, Field, FormSection } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { compose } from "redux";
import moment from "moment";
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Button,
  Collapse,
  Icon,
  Popconfirm,
  notification,
} from "antd";
import { sum, get, set, uniq, isArrayLike, isEmpty, isObjectLike, debounce } from "lodash";
import { renderConfig } from "@/components/common/config";
import { required, requiredList, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import {
  PROGRAM_END_DATE,
  NOMINATION_PHASE_EARLIEST_START_DATE,
  DATE_FORMAT,
  HELP_EMAIL,
  APPLICATION_PHASE_CODES,
  INDIGENOUS_SUBCONTRACTOR_AFFILIATION_SELECT_OPTIONS,
  DEFAULT_INDIGENOUS_COMMUNITIES_SELECT_OPTIONS,
} from "@/constants/strings";
import {
  currencyMask,
  formatMoney,
  scrollToFirstError,
  getPathsToLeaves,
  getFirstPathElement,
  getPathElements,
  wellAuthorizationNumberMask,
  sleep,
} from "@/utils/helpers";
import CONTRACT_WORK_SECTIONS from "@/constants/contract_work_sections";
import SITE_CONDITIONS from "@/constants/site_conditions";
import PermitHolderSelect from "@/components/forms/PermitHolderSelect";
import ApplicationFormReset from "@/components/forms/ApplicationFormReset";
import WellField from "@/components/forms/WellField";
import ApplicationFormTooltip from "@/components/common/ApplicationFormTooltip";
import { validateNominatedWell } from "@/actionCreators/OGCActionCreator";
import { getNominatedSelectedWells } from "@/selectors/OGCSelectors";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  application: PropTypes.objectOf(PropTypes.any),
  selectedWells: PropTypes.objectOf(PropTypes.any),
  isViewingSubmission: PropTypes.bool,
  isAdminEditMode: PropTypes.bool,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  application: {},
  selectedWells: [],
  isViewingSubmission: false,
  isAdminEditMode: false,
  isEditable: true,
};

const createMemberName = (member, name) => `${member}.${name}`;

const renderMoneyTotal = (label, amount, style) => (
  <Row type="flex" justify="end" gutter={16} style={style}>
    <Col>
      <Text className="color-primary" strong>
        {label} total:&nbsp;
      </Text>
    </Col>
    <Col style={{ textAlign: "right" }}>
      <Text>{formatMoney(amount || 0)}</Text>
    </Col>
  </Row>
);

const disabledStartDate = (date, wellSiteFormValues, contractWorkSection) => {
  const selectedDate = date ? moment(date) : null;
  const contractWorkValues = wellSiteFormValues ? wellSiteFormValues.contracted_work : null;
  const sectionValues = contractWorkValues
    ? contractWorkValues[contractWorkSection.formSectionName]
    : null;
  const endDate =
    sectionValues && sectionValues.planned_end_date ? moment(sectionValues.planned_end_date) : null;
  return (
    selectedDate &&
    (selectedDate < moment(NOMINATION_PHASE_EARLIEST_START_DATE, DATE_FORMAT) ||
      selectedDate > moment(PROGRAM_END_DATE, DATE_FORMAT) ||
      (endDate && selectedDate > endDate))
  );
};

const validateStartDate = (date, sectionValues) => {
  if (date === "Invalid date") {
    return "This is not a valid date value";
  }
  const selectedDate = date ? moment(date) : null;
  const endDate =
    sectionValues && sectionValues.planned_end_date ? moment(sectionValues.planned_end_date) : null;

  if (selectedDate) {
    if (selectedDate < moment(NOMINATION_PHASE_EARLIEST_START_DATE, DATE_FORMAT)) {
      return `Date cannot be before the date: ${NOMINATION_PHASE_EARLIEST_START_DATE}`;
    }
    if (selectedDate > moment(PROGRAM_END_DATE, DATE_FORMAT)) {
      return `Date cannot be after the program's end date: ${PROGRAM_END_DATE}`;
    }
    if (endDate && selectedDate > endDate) {
      return "Planned start date cannot be after end date";
    }
  }
  return undefined;
};

const disabledEndDate = (date, wellSiteFormValues, contractWorkSection) => {
  const selectedDate = date ? moment(date) : null;
  const contractWorkValues = wellSiteFormValues ? wellSiteFormValues.contracted_work : null;
  const sectionValues = contractWorkValues
    ? contractWorkValues[contractWorkSection.formSectionName]
    : null;
  const startDate =
    sectionValues && sectionValues.planned_start_date
      ? moment(sectionValues.planned_start_date)
      : null;
  return (
    selectedDate &&
    (selectedDate < moment(NOMINATION_PHASE_EARLIEST_START_DATE, DATE_FORMAT) ||
      selectedDate > moment(PROGRAM_END_DATE, DATE_FORMAT) ||
      (startDate && selectedDate < startDate))
  );
};

const validateEndDate = (date, sectionValues) => {
  if (date === "Invalid date") {
    return "This is not a valid date value";
  }
  const selectedDate = date ? moment(date) : null;
  const startDate =
    sectionValues && sectionValues.planned_start_date
      ? moment(sectionValues.planned_start_date)
      : null;
  if (selectedDate) {
    if (selectedDate < moment(NOMINATION_PHASE_EARLIEST_START_DATE, DATE_FORMAT)) {
      return `Date cannot be before the date: ${NOMINATION_PHASE_EARLIEST_START_DATE}`;
    }
    if (selectedDate > moment(PROGRAM_END_DATE, DATE_FORMAT)) {
      return `Date cannot be after the program's end date: ${PROGRAM_END_DATE}`;
    }
    if (startDate && selectedDate < startDate) {
      return "Planned end date cannot be before start date";
    }
  }
  return undefined;
};

const renderContractWorkPanel = (
  contractWorkSection,
  wellSectionTotal,
  isEditable,
  isAdminEditMode,
  isViewingSubmission,
  wellSiteFormValues,
  submitFailed,
  wellNumber,
  wellSectionErrors,
  application
) => {
  // Calculate the end date's default picker date to be the start date if the start date exists and is valid.
  const contractWorkValues = wellSiteFormValues ? wellSiteFormValues.contracted_work : null;
  const sectionValues = contractWorkValues
    ? contractWorkValues[contractWorkSection.formSectionName]
    : null;
  const startDate =
    sectionValues && sectionValues.planned_start_date
      ? moment(sectionValues.planned_start_date)
      : null;
  const defaultEndDatePickerValue = startDate || moment();

  // Only render the empty contracted work sections if the applicant is filling out their application
  const estimatedCostValues = sectionValues
    ? Object.values(sectionValues).filter((value) => !isNaN(value) && !(typeof value === "string"))
    : [];
  if (
    (isViewingSubmission || !isEditable) &&
    estimatedCostValues &&
    estimatedCostValues.length === 0
  ) {
    return;
  }

  return (
    <Panel
      key={contractWorkSection.sectionHeader}
      id={`well_sites[${wellNumber}].contracted_work.${contractWorkSection.formSectionName}-panel-header`}
      header={
        <Row type="flex" align="middle" justify="space-between">
          <Col>
            <Text className="color-primary font-size-large" strong>
              {contractWorkSection.sectionHeader}
            </Text>
          </Col>
          <Col>
            {renderMoneyTotal(contractWorkSection.sectionHeader, wellSectionTotal, {
              marginRight: 24,
            })}
          </Col>
        </Row>
      }
      // NOTE: Uncomment this if you want "scroll to error" to automatically open this panel if it's not loaded in the DOM.
      // forceRender={wellSectionErrors !== null}
    >
      <FormSection name={contractWorkSection.formSectionName}>
        <Form.Item
          label={
            <Text className="color-primary" strong>
              Planned Start and End Dates
            </Text>
          }
        >
          <Row gutter={48}>
            <Col span={12}>
              <Field
                name="planned_start_date"
                label="Planned Start Date"
                placeholder="Select Planned Start Date"
                error={wellSectionErrors && wellSectionErrors.planned_start_date}
                component={renderConfig.DATE}
                disabled={!isEditable && !isAdminEditMode}
                disabledDate={(date) =>
                  disabledStartDate(date, wellSiteFormValues, contractWorkSection)
                }
              />
            </Col>
            <Col span={12}>
              <Field
                name="planned_end_date"
                label="Planned End Date"
                placeholder="Select Planned End Date"
                error={wellSectionErrors && wellSectionErrors.planned_end_date}
                defaultPickerValue={defaultEndDatePickerValue}
                component={renderConfig.DATE}
                disabled={!isEditable && !isAdminEditMode}
                disabledDate={(date) =>
                  disabledEndDate(date, wellSiteFormValues, contractWorkSection)
                }
              />
            </Col>
          </Row>
        </Form.Item>
        {contractWorkSection.subSections.map((subSection) => (
          <Form.Item
            key={subSection.subSectionHeader}
            label={
              <Text className="color-primary" strong>
                {subSection.subSectionHeader}
              </Text>
            }
          >
            {subSection.amountFields.map((amountField) => (
              <Field
                key={amountField.fieldName}
                name={amountField.fieldName}
                label={amountField.fieldLabel}
                labelAlign="left"
                labelCol={{ md: { span: 14 } }}
                wrapperCol={{ md: { span: 8, offset: 2 } }}
                inputStyle={{ textAlign: "right" }}
                placeholder="$0.00"
                component={renderConfig.FIELD}
                disabled={!isEditable}
                {...currencyMask}
                onChange={(event, newValue) => {
                  if (newValue && newValue.toString().split(".")[0].length > 8) {
                    event.preventDefault();
                  }
                }}
              />
            ))}
          </Form.Item>
        ))}
        {renderMoneyTotal(contractWorkSection.sectionHeader, wellSectionTotal, { marginRight: 24 })}
        {(isEmpty(application) ||
          application.application_phase_code === APPLICATION_PHASE_CODES.NOMINATION) && (
          <FieldArray
            name="indigenous_subcontractors"
            component={renderIndigenousSubcontractor}
            isEditable={isEditable}
            isAdminEditMode={isAdminEditMode}
            isViewingSubmission={isViewingSubmission}
            parentSubmitFailed={submitFailed}
            wellSectionErrors={wellSectionErrors}
            application={application}
          />
        )}
        {submitFailed && wellSectionErrors && wellSectionErrors.error && (
          <span
            id={`well_sites[${wellNumber}].contracted_work.${contractWorkSection.formSectionName}.error`}
            className="color-error"
          >
            {wellSectionErrors.error}
          </span>
        )}
      </FormSection>
    </Panel>
  );
};

const asyncValidateError = (field, message) => {
  const errors = {};
  set(errors, field, message);
  throw errors;
};

const asyncValidateWell = async (values, field) => {
  if (isNaN(get(values, field))) {
    asyncValidateError(field, "Input must be a number.");
  }
  if (parseInt(get(values, field)) <= 0) {
    return;
  }
  return validateNominatedWell({ well_auth_number: parseInt(get(values, field)) }).then(
    (response) => {
      if (response.data.records.length === 0) asyncValidateError(field, "No match found.");
      if (response.data.records.length === 1) {
        if (!values.contract_details.operator_id)
          asyncValidateError(
            field,
            "Please select the valid permit holder above for this Well Authorization Number."
          );
        if (response.data.records[0].operator_id !== values.contract_details.operator_id)
          asyncValidateError(
            field,
            "This is not a nominated well site for this permit holder. If you do not have the Well Authorization Number, contact the permit holder."
          );
      }
      if (response.data.records.length > 1)
        asyncValidateError(
          field,
          `Multiple results were found for this Well Authorization Number. Please contact us for further assistance at ${HELP_EMAIL}`
        );
    }
  );
};

const asyncValidate = debounce(
  async (values, dispatch, props, field) => {
    if (!field || field === "contract_details.operator_id") {
      return Promise.all(
        values.well_sites.map((well, index) =>
          asyncValidateWell(
            values,
            `well_sites[${index}].details.well_authorization_number`
          ).then(() => {})
        )
      ).then(() => {});
    }

    if (field.includes("well_authorization_number") && get(values, field)) {
      return asyncValidateWell(values, field).then(() => {});
    }

    return Promise.resolve();
  },
  2000,
  {
    leading: true,
    trailing: true,
  }
);

// Unfortunately, FieldArray validation places the returned errors into an object under a key called "_error"
// which we don't want because we want to use the path in the object to determine the correct field to target.
const prepareErrors = (errors) => {
  if (isEmpty(errors)) {
    return errors;
  }

  const newErrors = errors;
  if (errors.well_sites && errors.well_sites._error) {
    const wellSitesErrors = errors.well_sites._error.well_sites;
    delete newErrors.well_sites;
    newErrors.well_sites = wellSitesErrors;
  }

  return newErrors;
};

const contractedWorkFormSectionNames = CONTRACT_WORK_SECTIONS.reduce(
  (list, { formSectionName }) => {
    list.push(formSectionName);
    return list;
  },
  []
);

const openRequiredPanels = async (errors) => {
  let waitForAnimations = Promise.resolve();

  let paths = getPathsToLeaves(errors);
  const elements = getPathElements(paths);
  const firstElement = getFirstPathElement(elements);
  let { path } = firstElement;

  if (!path) {
    // Workaround to get rid of well sites with no errors, they will appear in the list as "well_sites[0]", e.g., and have "undefined" as their error.
    paths = paths.filter((p) => p.length > 13);
    if (isEmpty(paths)) {
      return waitForAnimations;
    }
    path = paths[0];
  }

  // If this error is not for an element within a well site, there is no panels to open.
  const isWellSiteError = path.substring(0, 10) === "well_sites";
  if (!isWellSiteError) {
    return waitForAnimations;
  }

  // Get the well site index and element for this well site panel.
  const wellSiteIndex = parseInt(path.substring(path.indexOf("[") + 1, path.indexOf("]")));
  const wellSitePanelHeaderElement = document.getElementById(
    `well_sites[${wellSiteIndex}]-panel-header`
  );

  // Open the panel for this well site (if its not already).
  const animationDelayInMs = 600;
  if (!wellSitePanelHeaderElement.classList.contains("ant-collapse-item-active")) {
    wellSitePanelHeaderElement.firstChild.click();
    waitForAnimations = sleep(animationDelayInMs);
  }

  // If this element is also within a contracted work section panel, open that too.
  const pathSections = path.split(".");
  const isContractedWorkSectionError =
    pathSections[2] && contractedWorkFormSectionNames.indexOf(pathSections[2]) !== -1;

  if (isContractedWorkSectionError) {
    const contractedWorkSection = pathSections[2];
    const contractedWorkPanelHeaderElement = document.getElementById(
      `well_sites[${wellSiteIndex}].contracted_work.${contractedWorkSection}-panel-header`
    );
    if (
      contractedWorkPanelHeaderElement &&
      !contractedWorkPanelHeaderElement.classList.contains("ant-collapse-item-active")
    ) {
      contractedWorkPanelHeaderElement.firstChild.click();
      waitForAnimations = !waitForAnimations ? sleep(animationDelayInMs) : waitForAnimations;
    }
  }

  await waitForAnimations;
  return Promise.resolve(wellSitePanelHeaderElement.firstChild);
};

const validateWellSites = (value, allValues, props) => {
  const wellSites = value;
  if (!isArrayLike(wellSites) || isEmpty(wellSites)) {
    return undefined;
  }

  const errors = {};
  wellSites.map((wellSite, index) => {
    // Check that the well authorization number is valid.
    const validateRequired = required(get(wellSite, "details.well_authorization_number", null));
    if (validateRequired) {
      set(errors, `well_sites[${index}].details.well_authorization_number`, validateRequired);
    }

    // Check that there is at least one site condition checked.
    const siteConditions = get(wellSite, "site_conditions", null);
    const isAtleastOneSelected =
      !isEmpty(siteConditions) && !Object.values(siteConditions).every((condition) => !condition);
    if (
      !isAtleastOneSelected &&
      props.application?.application_phase_code === APPLICATION_PHASE_CODES.INITIAL
    ) {
      set(
        errors,
        `well_sites[${index}].site_conditions.error`,
        "Sites must meet at least one of the Eligibility Criteria to qualify for the program."
      );
    }

    // Check that at least one contracted work section is valid.
    let emptySectionsCount = 0;
    let validSectionsCount = 0;
    let invalidSectionsCount = 0;
    CONTRACT_WORK_SECTIONS.map((section) => {
      const sectionValues = get(wellSite, `contracted_work.${section.formSectionName}`, null);
      if (!isObjectLike(sectionValues) || isEmpty(sectionValues)) {
        emptySectionsCount++;
        return;
      }

      const requiredMessage = "This is a required field";
      const path = `well_sites[${index}].contracted_work.${section.formSectionName}`;

      let costSum = 0;
      section.subSections.map((subSection) =>
        subSection.amountFields.map(
          (amountField) => (costSum += sectionValues[amountField.fieldName] || 0)
        )
      );

      const startDate = sectionValues.planned_start_date;
      const endDate = sectionValues.planned_end_date;
      const subcontractors = sectionValues.indigenous_subcontractors;
      const hasConfirmedSubcontractors = sectionValues.has_confirmed_indigenous_subcontractors;
      const hasSubcontractors = isArrayLike(subcontractors) && !isEmpty(subcontractors);

      // If this is a blank section.
      if (!costSum && !startDate && !endDate && !hasSubcontractors) {
        emptySectionsCount++;

        // Cannot confirm subcontractors if this is an empty section.
        if (hasConfirmedSubcontractors) {
          set(
            errors,
            `${path}.has_confirmed_indigenous_subcontractors`,
            "You must provide other work activity information in order to check this field."
          );
          sectionErrorCount++;
        }
        return;
      }

      let sectionErrorCount = 0;

      // The confirmation checkbox for providing subcontractor information is always required.
      if (!hasConfirmedSubcontractors) {
        set(errors, `${path}.has_confirmed_indigenous_subcontractors`, requiredMessage);
        sectionErrorCount++;
      }

      // Start date is required if end date is provided, the cost sum is valid, or there are subcontractors.
      if (!startDate && (endDate || costSum || hasSubcontractors)) {
        set(errors, `${path}.planned_start_date`, requiredMessage);
        sectionErrorCount++;
      }

      // End date is required if start date is provided, the cost sum is valid, or there are subcontractors.
      if (!endDate && (startDate || costSum || hasSubcontractors)) {
        set(errors, `${path}.planned_end_date`, requiredMessage);
        sectionErrorCount++;
      }

      // The sum of the estimated work can't be 0/invalid if either of the dates are provided or there are subcontractors.
      if (!costSum && (startDate || endDate || hasSubcontractors)) {
        set(errors, `${path}.error`, "Total estimated cost cannot be $0.");
        sectionErrorCount++;
      }

      // Validate start date.
      const startDateError = validateStartDate(startDate, sectionValues);
      if (startDateError) {
        set(errors, `${path}.planned_start_date`, startDateError);
        sectionErrorCount++;
      }

      // Validate end date.
      const endDateError = validateEndDate(endDate, sectionValues);
      if (endDateError) {
        set(errors, `${path}.planned_end_date`, endDateError);
        sectionErrorCount++;
      }

      // Validate that there are no empty subcontractors (if there are any).
      if (!isEmpty(subcontractors)) {
        subcontractors.forEach((subcontractor, i) => {
          const subPath = `${path}.indigenous_subcontractors[${i}]`;

          const indigenousSubcontractorName = subcontractor.indigenous_subcontractor_name;
          if (isEmpty(indigenousSubcontractorName)) {
            set(errors, `${subPath}.indigenous_subcontractor_name`, requiredMessage);
            sectionErrorCount++;
          }

          const indigenousAffiliation = subcontractor.indigenous_affiliation;
          if (isEmpty(indigenousAffiliation)) {
            set(errors, `${subPath}.indigenous_affiliation`, requiredMessage);
            sectionErrorCount++;
          }

          const indigenousCommunities = subcontractor.indigenous_communities;
          if (isEmpty(indigenousCommunities)) {
            set(errors, `${subPath}.indigenous_communities`, requiredMessage);
            sectionErrorCount++;
          }
        });
      }

      if (sectionErrorCount === 0) {
        validSectionsCount++;
      } else {
        invalidSectionsCount++;
      }
    });

    if (emptySectionsCount === CONTRACT_WORK_SECTIONS.length) {
      set(
        errors,
        `well_sites[${index}].contracted_work.error`,
        "Sites must contain at least one valid contracted work section."
      );
    }

    // TODO: Use this for something? E.g., "3/5 entered sections are valid in the header of the well site".
    if (validSectionsCount === 0) {
    }
  });
  return isEmpty(errors) ? undefined : errors;
};

const IndigenousSubcontractor = (props) => (
  <Col key={props.index} xxl={{ span: 18 }} xl={{ span: 24 }}>
    <Card
      className="subcontractor-card"
      title={`Subcontractor ${props.index + 1}`}
      extra={
        props.isEditable && (
          <Popconfirm
            title="Are you sure you want to remove this subcontractor?"
            onConfirm={(e) => props.fields.remove(props.index)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
            arrowPointAtCenter
          >
            <Button type="link" className="color-white" style={{ float: "right" }}>
              <Icon type="delete" theme="filled" className="icon-lg" />
            </Button>
          </Popconfirm>
        )
      }
    >
      <Field
        id="indigenous_subcontractor_name"
        name={`${props.member}.indigenous_subcontractor_name`}
        label="Subcontractor Name"
        placeholder="Subcontractor Name"
        error={get(
          props.wellSectionErrors,
          `indigenous_subcontractors[${props.index}].indigenous_subcontractor_name`,
          null
        )}
        component={renderConfig.FIELD}
        disabled={!props.isEditable}
        validate={[required, maxLength(1024)]}
      />
      <Field
        id="indigenous_affiliation"
        name={`${props.member}.indigenous_affiliation`}
        label="Indigenous Affiliation"
        placeholder="Select an option"
        error={get(
          props.wellSectionErrors,
          `indigenous_subcontractors[${props.index}].indigenous_affiliation`,
          null
        )}
        component={renderConfig.SELECT}
        disabled={!props.isEditable}
        validate={[required]}
        format={null}
        data={INDIGENOUS_SUBCONTRACTOR_AFFILIATION_SELECT_OPTIONS}
      />
      <Field
        id="indigenous_communities"
        name={`${props.member}.indigenous_communities`}
        label={
          <>
            <div>Indigenous Peoples</div>
            {props.isEditable && (
              <div className="font-weight-normal">
                Select the Indigenous community(s) this subcontractor is affiliated with. If your
                Indigenous community is not in the list, you can type it in and select it as an
                option.
              </div>
            )}
          </>
        }
        placeholder="Select an option"
        error={get(
          props.wellSectionErrors,
          `indigenous_subcontractors[${props.index}].indigenous_communities`,
          null
        )}
        mode="tags"
        component={renderConfig.MULTI_SELECT}
        disabled={!props.isEditable}
        validate={[requiredList]}
        format={null}
        normalize={(value) => uniq(value.map((x) => x.trim())).filter((x) => !isEmpty(x))}
        data={DEFAULT_INDIGENOUS_COMMUNITIES_SELECT_OPTIONS}
      />
    </Card>
  </Col>
);

const renderIndigenousSubcontractor = (props) => (
  <>
    <Title level={4} style={{ margin: 0 }}>
      Indigenous Subcontractors
    </Title>
    {props.isEditable && (
      <Paragraph>
        List all subcontractors with an Indigenous affiliation that will be involved in completing
        this work.
      </Paragraph>
    )}
    {!isEmpty(props.fields) && (
      <Row gutter={48} type="flex" justify="center">
        {props.fields.map((member, index) => (
          <IndigenousSubcontractor member={member} index={index} {...props} />
        ))}
      </Row>
    )}
    {props.isEditable && (
      <>
        <br />
        <Button type="primary" onClick={() => props.fields.push({})}>
          Add Indigenous Subcontractor
        </Button>
        <br />
        <br />
      </>
    )}
    <Field
      id="has_confirmed_indigenous_subcontractors"
      name="has_confirmed_indigenous_subcontractors"
      label="If applicable, I have provided information for all Indigenous subcontractor(s) involved in completing this work."
      error={
        props.wellSectionErrors && props.wellSectionErrors.has_confirmed_indigenous_subcontractors
      }
      disabled={!props.isEditable}
      component={renderConfig.CHECKBOX}
    />
  </>
);

const renderWells = (props) => {
  // Ensure that there is always at least one well site.
  if (props.fields.length === 0) {
    props.fields.push({});
  }
  return (
    <>
      <Collapse
        defaultActiveKey={["0"]}
        bordered={false}
        accordion
        expandIcon={(panelProps) => (
          <Icon
            type={panelProps.isActive ? "minus-square" : "plus-square"}
            theme="filled"
            className="icon-lg"
          />
        )}
        defaultActiveKey={[0]}
      >
        {props.fields.map((member, index) => {
          const wellTotals = props.contractedWorkTotals.wellTotals[index];
          const wellSectionTotals = wellTotals ? wellTotals.sections : {};
          const wellTotal = wellTotals ? wellTotals.wellTotal : 0;

          // NOTE: Currently, selectedWells is only populated if the user interacts with the well auth input.
          const actualName = getWellName(index, props.formValues, props.selectedWells);
          let wellName = `Well Site ${index + 1}`;
          wellName += actualName ? ` (${actualName})` : "";

          const wellSiteErrors = get(props.meta, `error.well_sites[${index}]`, null);
          return (
            <Panel
              key={index}
              id={`well_sites[${index}]-panel-header`}
              header={
                <Title level={3} style={{ margin: 0, marginLeft: 8 }}>
                  {wellName}
                  {props.parentSubmitFailed && !isEmpty(wellSiteErrors) && (
                    <Text
                      className="font-size-base font-weight-normal color-error"
                      style={{ marginLeft: 16 }}
                    >
                      This well site has missing or incorrect information
                    </Text>
                  )}
                  {props.isEditable && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <Popconfirm
                        title="Are you sure you want to remove this well site?"
                        onConfirm={(e) => props.fields.remove(index)}
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                        arrowPointAtCenter
                      >
                        <Button type="link" className="color-primary" style={{ float: "right" }}>
                          <Icon type="delete" theme="filled" className="icon-lg" />
                        </Button>
                      </Popconfirm>
                    </span>
                  )}
                </Title>
              }
              // NOTE: Uncomment this if you want "scroll to error" to automatically open this panel if it's not loaded in the DOM.
              // forceRender={wellSiteErrors !== null}
            >
              <FormSection name={createMemberName(member, "details")}>
                <Title level={4}>Details</Title>
                <Row gutter={48}>
                  <Col>
                    <Field
                      name="well_authorization_number"
                      label="Well Authorization Number"
                      placeholder="Well Authorization Number"
                      component={WellField}
                      validate={[required]}
                      disabled={!props.isEditable}
                      label={
                        <>
                          Authorization Number
                          {props.isEditable &&
                            props.application?.application_phase_code ===
                              APPLICATION_PHASE_CODES.INITIAL && (
                              <>
                                <ApplicationFormTooltip content="Only wells that are classfied as Dormant with the Oil and Gas Commission can be entered." />
                                <a
                                  style={{ float: "right" }}
                                  href="https://reports.bcogc.ca/ogc/f?p=200:81:16594283755468"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Look up well
                                </a>
                              </>
                            )}
                        </>
                      }
                      {...wellAuthorizationNumberMask}
                    />
                  </Col>
                </Row>
              </FormSection>
              {props.application.application_phase_code === APPLICATION_PHASE_CODES.INITIAL && (
                <FormSection name={createMemberName(member, "site_conditions")}>
                  <Title level={4} className="application-subsection">
                    Eligibility Criteria
                  </Title>
                  <Paragraph>Select all criteria that apply to this site:</Paragraph>
                  <Row gutter={48}>
                    <Col className="application-checkbox-section">
                      {SITE_CONDITIONS.map((condition) => (
                        <Field
                          key={condition.fieldName}
                          name={condition.fieldName}
                          label={condition.fieldLabel}
                          disabled={!props.isEditable}
                          component={renderConfig.CHECKBOX}
                        />
                      ))}
                      {props.parentSubmitFailed &&
                        wellSiteErrors &&
                        wellSiteErrors.site_conditions &&
                        wellSiteErrors.site_conditions.error && (
                          <span
                            id={`well_sites[${index}].site_conditions.error`}
                            className="color-error"
                          >
                            {wellSiteErrors.site_conditions.error}
                          </span>
                        )}
                    </Col>
                  </Row>
                </FormSection>
              )}
              <FormSection name={createMemberName(member, "contracted_work")}>
                <Title level={4} className="application-subsection">
                  Contracted Work
                </Title>
                <Paragraph>
                  Enter the estimated cost of every work component your company will perform for
                  this contract.
                </Paragraph>
                {props.parentSubmitFailed &&
                  wellSiteErrors &&
                  wellSiteErrors.contracted_work &&
                  wellSiteErrors.contracted_work.error && (
                    <span id={`well_sites[${index}].contracted_work.error`} className="color-error">
                      {wellSiteErrors.contracted_work.error}
                    </span>
                  )}
                <Row gutter={48}>
                  <Col>
                    <Collapse
                      bordered={false}
                      expandIcon={(panelProps) => (
                        <Icon
                          type={panelProps.isActive ? "minus-square" : "plus-square"}
                          theme="filled"
                          className="icon-md"
                        />
                      )}
                    >
                      {CONTRACT_WORK_SECTIONS.map((contractWorkSection) =>
                        renderContractWorkPanel(
                          contractWorkSection,
                          wellSectionTotals[contractWorkSection.formSectionName],
                          props.isEditable,
                          props.isAdminEditMode,
                          props.isViewingSubmission,
                          props.formValues && props.formValues.well_sites
                            ? props.formValues.well_sites[index]
                            : null,
                          props.parentSubmitFailed,
                          index,
                          get(
                            wellSiteErrors,
                            `contracted_work.${contractWorkSection.formSectionName}`,
                            null
                          ),
                          props.application
                        )
                      )}
                    </Collapse>
                    {renderMoneyTotal("Well", wellTotal, { marginRight: 40, marginTop: 8 })}
                  </Col>
                </Row>
              </FormSection>
            </Panel>
          );
        })}
      </Collapse>
      <br />
      {props.isEditable && (
        <Button type="primary" onClick={() => props.fields.push({})}>
          Add Well Site
        </Button>
      )}
    </>
  );
};

// NOTE: We want to async validate ALWAYS for the three possible triggers. By default the submit trigger
// only async validates if !pristine || !initialized, which we don't want, since we save and load form values.
// https://redux-form.com/8.3.0/docs/api/reduxform.md/#-code-shouldasyncvalidate-params-boolean-code-optional-
const shouldAsyncValidate = ({ trigger, syncValidationPasses }) => {
  if (!syncValidationPasses) {
    return false;
  }
  switch (trigger) {
    case "blur":
    case "change":
    case "submit":
      return true;
    default:
      return false;
  }
};

const defaultState = {
  contractedWorkTotals: { grandTotal: 0, wellTotals: {} },
  renderedWarning: false,
};

const getWellName = (wellNumber, formValues, selectedWells) => {
  const wellAuthNumber =
    formValues &&
    formValues.well_sites &&
    formValues.well_sites[wellNumber] &&
    formValues.well_sites[wellNumber].details
      ? formValues.well_sites[wellNumber].details.well_authorization_number
      : null;
  const parsedWellAuthNumber = parseInt(wellAuthNumber);
  return parsedWellAuthNumber && selectedWells && selectedWells[parsedWellAuthNumber]
    ? selectedWells[parsedWellAuthNumber].well_name
    : null;
};

class ApplicationSectionTwo extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.debounceCalculateContractWorkTotals = debounce(this.calculateContractWorkTotals, 500);
  }

  handleReset = () => {
    this.props.initialize();
    this.props.handleReset();
  };

  componentWillReceiveProps = (nextProps) => {
    this.debounceCalculateContractWorkTotals(nextProps.formValues);

    if (nextProps.formValues.well_sites.length > 15 && !this.state.renderedWarning) {
      notification.warning({
        message: "Warning: Adding a large number of wells may impact application performance.",
        duration: 0,
      });
      this.setState({ renderedWarning: true });
    }
  };

  componentWillMount = () => {
    this.debounceCalculateContractWorkTotals(this.props.formValues);
  };

  componentWillUnmount() {
    if (this.props.isViewingSubmission) {
      this.props.reset();
    }
  }

  calculateContractWorkTotals = (formValues) => {
    if (!formValues || !formValues.well_sites) {
      this.setState(defaultState);
      return;
    }

    let grandTotal = 0;
    const wellTotals = {};
    formValues.well_sites.map((wellSite, wellIndex) => {
      wellTotals[wellIndex] = { wellTotal: 0, sections: {} };

      if (!wellSite.contracted_work) {
        return;
      }

      const sectionNames = Object.keys(wellSite.contracted_work);
      const sectionValues = Object.values(wellSite.contracted_work);

      let wellTotal = 0;
      sectionValues.map((section, sectionIndex) => {
        const sectionName = sectionNames[sectionIndex];

        let sectionTotal = 0;
        CONTRACT_WORK_SECTIONS.find((x) => x.formSectionName === sectionName).subSections.map((x) =>
          x.amountFields.map((x) => (sectionTotal += section[x.fieldName] || 0))
        );

        wellTotals[wellIndex].sections[sectionName] = sectionTotal;
        wellTotal += sectionTotal;
      });
      wellTotals[wellIndex].wellTotal = wellTotal;

      grandTotal += wellTotal;
    });

    const contractedWorkTotals = { grandTotal, wellTotals };
    this.setState({ contractedWorkTotals });
  };

  render() {
    const wellTotalsValues = Object.values(this.state.contractedWorkTotals.wellTotals);

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <FormSection name="contract_details">
          <Title level={3} className="application-section">
            Contract Information
          </Title>
          <Row gutter={48}>
            <Col>
              <Paragraph>
                Select the permit holder for whom the proposed work will be performed. You must have
                a contract with the permit holder for this work in order to be eligible.
              </Paragraph>
              <Field
                id="operator_id"
                name="operator_id"
                label={
                  <>
                    Permit Holder
                    {this.props.isEditable && (
                      <ApplicationFormTooltip content="Only businesses with permits for dormant well sites can be selected." />
                    )}
                  </>
                }
                placeholder="Search for permit holder for whom this work will be performed"
                component={PermitHolderSelect}
                disabled={!this.props.isEditable && !this.props.isAdminEditMode}
                validate={[required]}
              />
            </Col>
          </Row>
        </FormSection>

        <Title level={3} className="application-section">
          Well Sites
        </Title>
        <Paragraph>
          Identify each well site in your contract with the permit holder and provide the relevant
          work details.
        </Paragraph>
        <Row gutter={[48, 48]}>
          <Col>
            <FieldArray
              name="well_sites"
              validate={validateWellSites}
              component={renderWells}
              isEditable={this.props.isEditable}
              isAdminEditMode={this.props.isAdminEditMode}
              isViewingSubmission={this.props.isViewingSubmission}
              formValues={this.props.formValues}
              parentSubmitFailed={this.props.submitFailed}
              selectedWells={this.props.selectedWells}
              contractedWorkTotals={this.state.contractedWorkTotals}
              application={this.props.application}
            />
          </Col>
        </Row>

        <br />
        <Title level={3} className="application-section">
          Estimated Cost Summary
        </Title>
        {(wellTotalsValues.length > 0 && (
          <Row gutter={16} type="flex" justify="start" align="bottom">
            <Col style={{ textAlign: "right" }}>
              {wellTotalsValues.map((wellTotal, index) => {
                const actualName = getWellName(
                  index,
                  this.props.formValues,
                  this.props.selectedWells
                );
                let wellName = `Well Site ${index + 1}`;
                wellName += actualName ? ` (${actualName})` : "";
                return (
                  <>
                    <Paragraph key={`${wellName}.${index}`} className="color-primary" strong>
                      {`${wellName} total:`}&nbsp;
                    </Paragraph>
                    {wellTotal.sections &&
                      CONTRACT_WORK_SECTIONS.filter(
                        (section) =>
                          wellTotal.sections[section.formSectionName] &&
                          wellTotal.sections[section.formSectionName] > 0
                      ).map((section) => (
                        <Paragraph
                          key={`${section.sectionHeader}.${index}`}
                          className="color-primary"
                        >
                          {`${section.sectionHeader} total:`}&nbsp;
                        </Paragraph>
                      ))}
                  </>
                );
              })}
              <Paragraph className="color-primary" strong>
                Grand total:&nbsp;
              </Paragraph>
            </Col>
            <Col style={{ textAlign: "right" }}>
              {wellTotalsValues.map((wellTotal, index) => (
                <>
                  <Paragraph key={`well-total.${index}`}>
                    {formatMoney(wellTotal.wellTotal || 0)}
                  </Paragraph>
                  {wellTotal.sections &&
                    CONTRACT_WORK_SECTIONS.filter(
                      (section) =>
                        wellTotal.sections[section.formSectionName] &&
                        wellTotal.sections[section.formSectionName] > 0
                    ).map((section) => (
                      <Paragraph key={`${section.formSectionName}.${index}`}>
                        {formatMoney(wellTotal.sections[section.formSectionName] || 0)}
                      </Paragraph>
                    ))}
                </>
              ))}
              <Paragraph strong>
                {formatMoney(this.state.contractedWorkTotals.grandTotal || 0)}
              </Paragraph>
            </Col>
          </Row>
        )) || <Paragraph>Add a well site to see your estimated cost summary.</Paragraph>}
        {this.props.isEditable && (
          <Row className="steps-action">
            <Col>
              <Button onClick={this.props.previousStep}>Previous</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={this.props.submitting}
                style={{ marginLeft: 8, marginRight: 8 }}
              >
                Next
              </Button>
              <ApplicationFormReset onConfirm={this.handleReset} />
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.APPLICATION_FORM)(state),
  selectedWells: getNominatedSelectedWells(state),
});

const mapDispatchToProps = () => ({});

ApplicationSectionTwo.propTypes = propTypes;
ApplicationSectionTwo.defaultProps = defaultProps;

export default compose(
  reduxForm({
    form: FORM.APPLICATION_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
    shouldAsyncValidate,
    asyncValidate,
    asyncBlurFields: [
      "contract_details.operator_id",
      "well_sites[].details.well_authorization_number",
    ],
    onSubmitFail: (errors) => {
      if (!isObjectLike(errors)) {
        return;
      }
      const newErrors = prepareErrors(errors);
      openRequiredPanels(newErrors).then((fallbackElement) => {
        scrollToFirstError(newErrors, fallbackElement);
      });
    },
  }),
  connect(mapStateToProps, mapDispatchToProps)
)(ApplicationSectionTwo);
