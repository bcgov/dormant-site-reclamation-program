import React, { Component } from "react";
import { reduxForm, FieldArray, getFormValues, Field, FormSection } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { compose } from "redux";
import moment from "moment";
import { Row, Col, Typography, Form, Button, Collapse } from "antd";
import { sum, get, set } from "lodash";
import { renderConfig } from "@/components/common/config";
import { required, number } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import { PROGRAM_START_DATE, PROGRAM_END_DATE } from "@/constants/strings";
import { currencyMask, formatMoney, scrollToFirstError } from "@/utils/helpers";
import CONTRACT_WORK_SECTIONS from "@/constants/contract_work_sections";
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
  selectedWells: PropTypes.arrayOf(PropTypes.any),
  isViewingSubmission: PropTypes.bool,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  selectedWells: [],
  isViewingSubmission: false,
  isEditable: true,
};

const createMemberName = (member, name) => `${member}.${name}`;

const wellSiteConditions = [
  "Within 1000 m of a stream (defined in WSA and includes all water bodies)",
  "Within 500 m of a groundwater drinking well",
  "Sensitive habitat",
  "Suspected or known to have offsite contamination",
  "Within 1500 m of a school or residence",
  "On Traditional Lands Entitlement, cultural lands and/or First Nations critical area",
  "On Agricultural Land Reserve",
  "On range tenure, trapping licence, guide outfitting, and/or hunting area",
  "Winter only access",
  "On Private land",
  "Drilled or abandoned prior to 1997",
];

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

const renderContractWorkPanel = (
  contractWorkSection,
  wellSectionTotal,
  isEditable,
  wellSiteFormValues
) => (
  <Panel
    key={contractWorkSection.sectionHeader}
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
              component={renderConfig.DATE}
              disabled={!isEditable}
              disabledDate={(date) => {
                const selectedDate = date ? moment(date) : null;
                const contractWorkValues = wellSiteFormValues.contracted_work;
                const sectionValues = contractWorkValues
                  ? contractWorkValues[contractWorkSection.formSectionName]
                  : null;
                const endDate =
                  sectionValues && sectionValues.planned_end_date
                    ? moment(sectionValues.planned_end_date)
                    : null;
                return (
                  selectedDate &&
                  (selectedDate < moment(PROGRAM_START_DATE, "YYYY-MM-DD") ||
                    selectedDate > moment(PROGRAM_END_DATE, "YYYY-MM-DD") ||
                    (endDate && selectedDate > endDate))
                );
              }}
            />
          </Col>
          <Col span={12}>
            <Field
              name="planned_end_date"
              label="Planned End Date"
              placeholder="Select Planned End Date"
              component={renderConfig.DATE}
              disabled={!isEditable}
              disabledDate={(date) => {
                const selectedDate = date ? moment(date) : null;
                const contractWorkValues = wellSiteFormValues.contracted_work;
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
              }}
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
            />
          ))}
        </Form.Item>
      ))}
      {renderMoneyTotal(contractWorkSection.sectionHeader, wellSectionTotal, { marginRight: 24 })}
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
        "Multiple results for this Authorization Number. Please contact us for further assistance."
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

const defaultState = {
  contractedWorkTotals: { grandTotal: 0, wellTotals: {} },
};

class ApplicationSectionTwo extends Component {
  state = defaultState;

  handleReset = () => {
    this.props.initialize();
    this.props.handleReset();
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues !== this.props.formValues) {
      this.calculateContractWorkTotals(nextProps.formValues);
    }
  };

  componentDidMount = () => {
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

  getWellName(wellNumber) {
    const wellAuthNumber =
      this.props.formValues &&
      this.props.formValues.well_sites &&
      this.props.formValues.well_sites[wellNumber] &&
      this.props.formValues.well_sites[wellNumber].details
        ? this.props.formValues.well_sites[wellNumber].details.well_authorization_number
        : null;
    return wellAuthNumber && this.props.selectedWells && this.props.selectedWells[wellAuthNumber]
      ? this.props.selectedWells[wellAuthNumber].well_name
      : null;
  }

  renderWells = ({ fields }) => (
    <>
      <Collapse bordered={false} accordion>
        {fields.map((member, index) => {
          const wellTotals = this.state.contractedWorkTotals.wellTotals[index];
          const wellSectionTotals = wellTotals ? wellTotals.sections : {};
          const wellTotal = wellTotals ? wellTotals.wellTotal : 0;

          const actualName = this.getWellName(index);
          let wellName = `Well Site #${index + 1}`;
          wellName += actualName ? ` (${actualName})` : "";

          return (
            <Panel
              key={index}
              header={
                <Title level={3}>
                  {/* NOTE: Could update name with the well's name when it is retrieved. */}
                  {wellName}
                  {this.props.isEditable && (
                    <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
                      Remove
                    </Button>
                  )}
                </Title>
              }
            >
              <FormSection name={createMemberName(member, "details")}>
                <Title level={4}>Details</Title>
                <Row gutter={48}>
                  <Col span={24}>
                    <Field
                      name="well_authorization_number"
                      label="Well Authorization Number"
                      placeholder="Well Authorization Number"
                      component={WellField}
                      validate={[required, number]}
                      disabled={!this.props.isEditable}
                      label={
                        <>
                          Authorization Number
                          {this.props.isEditable && (
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
                    />
                  </Col>
                </Row>
              </FormSection>

              <FormSection name={createMemberName(member, "site_conditions")}>
                <Title level={4} className="application-subsection">
                  Site Conditions
                </Title>
                <Paragraph>Reasons for site nomination (select all that apply):</Paragraph>
                <Row gutter={48}>
                  <Col span={24} className="application-checkbox-section">
                    {wellSiteConditions.map((condition, index) => (
                      <Field
                        key={index}
                        name={`site_condition_${index}`}
                        label={condition}
                        disabled={!this.props.isEditable}
                        component={renderConfig.CHECKBOX}
                      />
                    ))}
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
                <Row gutter={48}>
                  <Col span={24}>
                    <Collapse bordered={false}>
                      {CONTRACT_WORK_SECTIONS.map((contractWorkSection) =>
                        renderContractWorkPanel(
                          contractWorkSection,
                          wellSectionTotals[contractWorkSection.formSectionName],
                          this.props.isEditable,
                          this.props.formValues && this.props.formValues.well_sites
                            ? this.props.formValues.well_sites[index]
                            : null
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
      {this.props.isEditable && (
        <Button type="primary" onClick={() => fields.push({})}>
          Add Well Site
        </Button>
      )}
    </>
  );

  render() {
    const wellTotalsValues = Object.values(this.state.contractedWorkTotals.wellTotals);

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <FormSection name="contract_details">
          <Title level={2} className="application-section">
            Contract Information
          </Title>
          <Row gutter={48}>
            <Col>
              <Field
                id="operator_id"
                name="operator_id"
                label={
                  <>
                    Permit Holder
                    {this.props.isEditable && (
                      <ApplicationFormTooltip content="Only businesses with permits for dormant wells can be entered." />
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

        <Title level={2} className="application-section">
          Well Sites
        </Title>
        <Row gutter={[48, 48]}>
          <Col>
            <FieldArray name="well_sites" component={this.renderWells} />
          </Col>
        </Row>

        <br />
        <Title level={2} className="application-section">
          Estimated Cost Summary
        </Title>
        {(wellTotalsValues.length > 0 && (
          <Row gutter={16} type="flex" justify="start" align="bottom">
            <Col style={{ textAlign: "right" }}>
              {wellTotalsValues.map((wellTotal, index) => {
                const actualName = this.getWellName(index);
                let wellName = `Well Site #${index + 1}`;
                wellName += actualName ? ` (${actualName})` : "";
                return (
                  <>
                    <Paragraph key={index} className="color-primary" strong>
                      {`${wellName} total:`}&nbsp;
                    </Paragraph>
                    {wellTotal.sections &&
                      CONTRACT_WORK_SECTIONS.filter(
                        (section) =>
                          wellTotal.sections[section.formSectionName] &&
                          wellTotal.sections[section.formSectionName] > 0
                      ).map((section) => (
                        <Paragraph key={index} className="color-primary">
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
                  <Paragraph key={index}>{formatMoney(wellTotal.wellTotal || 0)}</Paragraph>
                  {wellTotal.sections &&
                    CONTRACT_WORK_SECTIONS.filter(
                      (section) =>
                        wellTotal.sections[section.formSectionName] &&
                        wellTotal.sections[section.formSectionName] > 0
                    ).map((section) => (
                      <Paragraph key={index}>
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
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.APPLICATION_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
    asyncValidate,
    asyncChangeFields: [
      "contract_details.operator_id",
      "well_sites[].details.well_authorization_number",
    ],
    onSubmitFail: (errors) => scrollToFirstError(errors),
  })
)(ApplicationSectionTwo);
