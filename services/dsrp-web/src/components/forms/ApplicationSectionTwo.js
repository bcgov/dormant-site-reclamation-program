import React, { Component } from "react";
import { reduxForm, FieldArray, getFormValues, Field, FormSection } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { compose } from "redux";
import moment from "moment";
import { Row, Col, Typography, Form, Button, Collapse, Icon, Popconfirm } from "antd";
import { sum, get, set, isEqual, isArrayLike, isEmpty, isObjectLike } from "lodash";
import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import { PROGRAM_START_DATE, PROGRAM_END_DATE } from "@/constants/strings";
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
import { validateWell } from "@/actionCreators/OGCActionCreator";
import { getSelectedWells } from "@/selectors/OGCSelectors";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  selectedWells: PropTypes.objectOf(PropTypes.any),
  isViewingSubmission: PropTypes.bool,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  selectedWells: [],
  isViewingSubmission: false,
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
    (selectedDate < moment(PROGRAM_START_DATE, "YYYY-MM-DD") ||
      selectedDate > moment(PROGRAM_END_DATE, "YYYY-MM-DD") ||
      (endDate && selectedDate > endDate))
  );
};

const validateStartDate = (date, wellSiteFormValues, contractWorkSection) => {
  if (date === "Invalid date") {
    return "This is not a valid date value";
  }
  const selectedDate = date ? moment(date) : null;
  const contractWorkValues = wellSiteFormValues ? wellSiteFormValues.contracted_work : null;
  const sectionValues = contractWorkValues
    ? contractWorkValues[contractWorkSection.formSectionName]
    : null;
  const endDate =
    sectionValues && sectionValues.planned_end_date ? moment(sectionValues.planned_end_date) : null;
  if (selectedDate) {
    if (selectedDate < moment(PROGRAM_START_DATE, "YYYY-MM-DD")) {
      return `Date cannot be before the program's start date: ${PROGRAM_START_DATE}`;
    }
    if (selectedDate > moment(PROGRAM_END_DATE, "YYYY-MM-DD")) {
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
    (selectedDate < moment(PROGRAM_START_DATE, "YYYY-MM-DD") ||
      selectedDate > moment(PROGRAM_END_DATE, "YYYY-MM-DD") ||
      (startDate && selectedDate < startDate))
  );
};

const validateEndDate = (date, wellSiteFormValues, contractWorkSection) => {
  if (date === "Invalid date") {
    return "This is not a valid date value";
  }
  const selectedDate = date ? moment(date) : null;
  const contractWorkValues = wellSiteFormValues ? wellSiteFormValues.contracted_work : null;
  const sectionValues = contractWorkValues
    ? contractWorkValues[contractWorkSection.formSectionName]
    : null;
  const startDate =
    sectionValues && sectionValues.planned_start_date
      ? moment(sectionValues.planned_start_date)
      : null;
  if (selectedDate) {
    if (selectedDate < moment(PROGRAM_START_DATE, "YYYY-MM-DD")) {
      return `Date cannot be before the program's start date: ${PROGRAM_START_DATE}`;
    }
    if (selectedDate > moment(PROGRAM_END_DATE, "YYYY-MM-DD")) {
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
  wellSiteFormValues,
  submitFailed,
  wellNumber,
  wellSectionErrors
) => (
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
    forceRender={wellSectionErrors !== null}
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
              disabled={!isEditable}
              // disabledDate={(date) =>
              //   disabledStartDate(date, wellSiteFormValues, contractWorkSection)
              // }
              // validate={(date) => validateStartDate(date, wellSiteFormValues, contractWorkSection)}
            />
          </Col>
          <Col span={12}>
            <Field
              name="planned_end_date"
              label="Planned End Date"
              placeholder="Select Planned End Date"
              error={wellSectionErrors && wellSectionErrors.planned_end_date}
              component={renderConfig.DATE}
              disabled={!isEditable}
              // disabledDate={(date) =>
              //   disabledEndDate(date, wellSiteFormValues, contractWorkSection)
              // }
              // validate={(date) => validateEndDate(date, wellSiteFormValues, contractWorkSection)}
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

const asyncValidateError = (field, message) => {
  const errors = {};
  set(errors, field, message);
  throw errors;
};

const asyncValidateWell = async (values, field) => {
  if (isNaN(get(values, field))) {
    asyncValidateError(field, "Input must be a number.");
  }
  return validateWell({ well_auth_number: get(values, field) }).then((response) => {
    if (response.data.records.length === 0)
      asyncValidateError(
        field,
        "No match found. Enter another number or use the Look up well link to find the correct Authorization Number."
      );
    if (response.data.records.length === 1) {
      if (!values.contract_details.operator_id)
        asyncValidateError(
          field,
          "Please select the valid Permit Holder above for this Authorization Number."
        );
      if (response.data.records[0].operator_id !== values.contract_details.operator_id)
        asyncValidateError(
          field,
          "This Authorization Number does not belong to the selected Permit Holder. Enter another number or use the Look up well link to find the correct Authorization Number."
        );
    }
    if (response.data.records.length > 1)
      asyncValidateError(
        field,
        "Multiple results for this Authorization Number. Please contact us for further assistance at DormantSite.BC.Government@gov.bc.ca"
      );
  });
};

const asyncValidate = (values, dispatch, props, field) => {
  if (!field || field === "contract_details.operator_id") {
    return Promise.all(
      values.well_sites.map((well, index) =>
        asyncValidateWell(
          values,
          `well_sites[${index}].details.well_authorization_number`
        ).then(() => {})
      )
    );
  }

  if (field.includes("well_authorization_number") && get(values, field)) {
    return asyncValidateWell(values, field);
  }
};

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
  const paths = getPathsToLeaves(errors);
  const elements = getPathElements(paths);
  const firstElement = getFirstPathElement(elements);
  const path = firstElement.path;

  if (!path) {
    return waitForAnimations;
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
    if (!contractedWorkPanelHeaderElement.classList.contains("ant-collapse-item-active")) {
      contractedWorkPanelHeaderElement.firstChild.click();
      waitForAnimations = !waitForAnimations ? sleep(animationDelayInMs) : waitForAnimations;
    }
  }

  return waitForAnimations;
};

const validateWellSites = (wellSites, formValues, props) => {
  const errors = {};

  if (!isArrayLike(wellSites) || isEmpty(wellSites)) {
    return undefined;
  }

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
    if (!isAtleastOneSelected) {
      set(
        errors,
        `well_sites[${index}].site_conditions.error`,
        "Sites must meet at least one of the Eligibility Criteria to qualify for the program."
      );
    }

    // Check that at least one contracted work section is valid.
    let emptySectionsCount = 0;
    let validSectionsCount = 0;
    CONTRACT_WORK_SECTIONS.map((section) => {
      const sectionValues = get(wellSite, `contracted_work.${section.formSectionName}`, null);
      if (!isObjectLike(sectionValues) || isEmpty(sectionValues)) {
        emptySectionsCount++;
        return;
      }

      const requiredMessage = "This is a required field";
      const path = `well_sites[${index}].contracted_work.${section.formSectionName}`;
      const costSum = sum(Object.values(sectionValues).filter((value) => !isNaN(value)));
      const startDate = sectionValues.planned_start_date;
      const endDate = sectionValues.planned_end_date;

      // If this is a blank section.
      if (!costSum && !startDate && !endDate) {
        emptySectionsCount++;
        return;
      }

      let sectionErrorCount = 0;

      // Start date is required if end date is provided or the cost sum is valid.
      if (!startDate && (endDate || costSum)) {
        set(errors, `${path}.planned_start_date`, requiredMessage);
        sectionErrorCount++;
      }

      // End date is required if start date is provided or the cost sum is valid.
      if (!endDate && (startDate || costSum)) {
        set(errors, `${path}.planned_end_date`, requiredMessage);
        sectionErrorCount++;
      }

      // The sum of the estimated work can't be 0/invalid if either of the dates are provided.
      if (!costSum && (startDate || endDate)) {
        set(errors, `${path}.error`, "Total estimated cost cannot be $0.");
        sectionErrorCount++;
      }

      // Validate start date
      const startDateError = validateStartDate(startDate, sectionValues, section);
      if (startDateError) {
        set(errors, `${path}.planned_start_date`, startDateError);
        sectionErrorCount++;
      }

      // Validate end date
      const endDateError = validateEndDate(endDate, sectionValues, section);
      if (endDateError) {
        set(errors, `${path}.planned_end_date`, endDateError);
        sectionErrorCount++;
      }

      if (sectionErrorCount === 0) {
        validSectionsCount++;
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

          const actualName = getWellName(index, props.formValues);
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
                        onConfirm={(e) => fields.remove(index)}
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
              forceRender={wellSiteErrors !== null}
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
                          {props.isEditable && (
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
                          props.formValues && props.formValues.well_sites
                            ? props.formValues.well_sites[index]
                            : null,
                          props.parentSubmitFailed,
                          index,
                          get(
                            wellSiteErrors,
                            `contracted_work.${contractWorkSection.formSectionName}`,
                            null
                          )
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
};

const getWellName = (wellNumber, formValues, selectedWells) => {
  const wellAuthNumber =
    formValues &&
    formValues.well_sites &&
    formValues.well_sites[wellNumber] &&
    formValues.well_sites[wellNumber].details
      ? formValues.well_sites[wellNumber].details.well_authorization_number
      : null;
  return wellAuthNumber && selectedWells && selectedWells[wellAuthNumber]
    ? selectedWells[wellAuthNumber].well_name
    : null;
};

class ApplicationSectionTwo extends Component {
  state = defaultState;

  handleReset = () => {
    this.props.initialize();
    this.props.handleReset();
  };

  componentWillReceiveProps = (nextProps) => {
    if (!isEqual(nextProps.formValues, this.props.formValues)) {
      this.calculateContractWorkTotals(nextProps.formValues);
    }
  };

  componentWillMount = () => {
    this.calculateContractWorkTotals(this.props.formValues);
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
        const sectionTotal = sum(Object.values(section).filter((value) => !isNaN(value)));
        wellTotals[wellIndex].sections[sectionNames[sectionIndex]] = sectionTotal;
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
                Select the permit holder for whom the proposed work will be performed. You must a
                contract with the permit holder for this work in order to be eligible.
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
                disabled={!this.props.isEditable}
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
              formValues={this.props.formValues}
              parentSubmitFailed={this.props.submitFailed}
              contractedWorkTotals={this.state.contractedWorkTotals}
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
  selectedWells: getSelectedWells(state),
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
    asyncChangeFields: [
      "contract_details.operator_id",
      "well_sites[].details.well_authorization_number",
    ],
    onSubmitFail: (errors) => {
      if (!isObjectLike(errors)) {
        return;
      }
      const newErrors = prepareErrors(errors);
      openRequiredPanels(newErrors).then(() => scrollToFirstError(newErrors));
    },
  }),
  connect(mapStateToProps, mapDispatchToProps)
)(ApplicationSectionTwo);
