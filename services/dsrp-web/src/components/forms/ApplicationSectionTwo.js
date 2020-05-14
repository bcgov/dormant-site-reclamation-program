import React, { Component } from "react";
import { reduxForm, FieldArray, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Row, Col, Typography, Form, Divider, Button, Collapse, Descriptions, Icon } from "antd";
import { Field, FormSection } from "redux-form";
import { sum, flatten, union, merge } from "lodash";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import { currencyMask, formatMoney } from "@/utils/helpers";
import CONTRACT_WORK_SECTIONS from "@/components/forms/contract_work_sections";
import PermitHolderSelect from "@/components/forms/PermitHolderSelect";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const defaultProps = {};

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

const renderMoneyTotal = (label, amount) => (
  <Paragraph>
    <Text className="color-primary" strong>
      {label}:&nbsp;
    </Text>
    <Text>{formatMoney(amount || 0)}</Text>
  </Paragraph>
);

const renderContractWorkPanel = (contractWorkSection, wellSectionTotal) => (
  <Panel header={<Title level={4}>{contractWorkSection.sectionHeader}</Title>}>
    <FormSection name={contractWorkSection.formSectionName}>
      <Form.Item
        label={
          <Text className="color-primary" strong>
            Contract Work Start and End Dates
          </Text>
        }
      >
        <Row gutter={48}>
          <Col span={12}>
            <Field
              name="work_start_date"
              label="Work Start Date"
              placeholder="Select work start date"
              component={renderConfig.DATE}
            />
          </Col>
          <Col span={12}>
            <Field
              name="work_end_date"
              label="Work End Date"
              placeholder="Select work end date"
              component={renderConfig.DATE}
            />
          </Col>
        </Row>
      </Form.Item>
      {contractWorkSection.subSections.map((subSection) => (
        <Form.Item
          label={
            <Text className="color-primary" strong>
              {subSection.subSectionHeader}
            </Text>
          }
        >
          {subSection.amountFields.map((amountField) => (
            <Field
              name={amountField.fieldName}
              label={amountField.fieldLabel}
              placeholder="$0.00"
              component={renderConfig.FIELD}
              {...currencyMask}
            />
          ))}
        </Form.Item>
      ))}
      {renderMoneyTotal("Section total", wellSectionTotal)}
    </FormSection>
  </Panel>
);

class ApplicationSectionTwo extends Component {
  state = {
    contractedWorkTotals: { grandTotal: 0, wellTotals: {} },
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues !== this.props.formValues) {
      this.calculateContractWorkTotals(nextProps.formValues);
    }
  };

  componentWillMount = () => {
    this.calculateContractWorkTotals(this.props.formValues);
  };

  calculateContractWorkTotals = (formValues) => {
    if (!formValues || !formValues.well_sites) {
      return;
    }

    let grandTotal = 0;
    let wellTotals = {};
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

  renderWells = ({ fields }) => (
    <>
      <Collapse bordered={false} accordion>
        {fields.map((member, index) => {
          const wellTotals = this.state.contractedWorkTotals.wellTotals[index];
          const wellSectionTotals = wellTotals ? wellTotals.sections : {};
          const wellTotal = wellTotals ? wellTotals.wellTotal : 0;
          return (
            <Panel
              key={index}
              header={
                <Title level={3}>
                  {/* NOTE: Could update name with the well's name when it is retrieved. */}
                  Well Site #{index + 1}
                  <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
                    Remove
                  </Button>
                </Title>
              }
            >
              <FormSection name={createMemberName(member, "details")}>
                <Title level={3}>Details</Title>
                <Row gutter={48}>
                  <Col span={24}>
                    <Field
                      name="well_authorization_number"
                      label="Well Authorization Number"
                      placeholder="Well Authorization Number"
                      component={renderConfig.FIELD}
                      validate={[required]}
                    />
                    <Descriptions column={1} title="Well Site Details">
                      <Descriptions.Item label="Name">N/A</Descriptions.Item>
                      <Descriptions.Item label="Operator">N/A</Descriptions.Item>
                      <Descriptions.Item label="Location">N/A</Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </FormSection>

              <FormSection name={createMemberName(member, "site_conditions")}>
                <Title level={3}>Site Conditions</Title>
                <Paragraph>Reasons for site nomination (select all that apply):</Paragraph>
                <Row gutter={48}>
                  <Col span={24}>
                    {wellSiteConditions.map((condition, index) => (
                      <Field
                        name={`site_condition_${index}`}
                        label={condition}
                        component={renderConfig.CHECKBOX}
                      />
                    ))}
                  </Col>
                </Row>
              </FormSection>

              <FormSection name={createMemberName(member, "contracted_work")}>
                <Title level={3}>Contracted Work</Title>
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
                          wellSectionTotals[contractWorkSection.formSectionName]
                        )
                      )}
                    </Collapse>
                    {renderMoneyTotal("Well total", wellTotal)}
                  </Col>
                </Row>
              </FormSection>
            </Panel>
          );
        })}
      </Collapse>
      <br />
      <Button type="primary" onClick={() => fields.push({})}>
        Add Well Site
      </Button>
    </>
  );

  render() {
    const wellTotalsValues = Object.values(this.state.contractedWorkTotals.wellTotals);

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="contract_details">
          <Title level={2}>Contract Information</Title>
          <Row gutter={48}>
            <Col>
              <Field
                id="organization_id"
                name="organization_id"
                label="Permit Holder"
                placeholder="Search for permit holder for whom this work will be performed"
                component={PermitHolderSelect}
                // validate={[required]}
              />
            </Col>
          </Row>
        </FormSection>

        <Title level={2}>Well Sites</Title>
        <Row gutter={[48, 48]}>
          <Col>
            <FieldArray name="well_sites" component={this.renderWells} />
          </Col>
        </Row>

        <br />
        <Title level={3}>Estimated Expense Summary</Title>
        {(wellTotalsValues.length > 0 && (
          <Row gutter={16} type="flex">
            <Col style={{ textAlign: "right" }}>
              {wellTotalsValues.map((wellTotal, index) => (
                <Paragraph className="color-primary" strong>
                  {`Well Site #${index + 1} total:`}&nbsp;
                </Paragraph>
              ))}
              <Paragraph className="color-primary" strong>
                Grand total:&nbsp;
              </Paragraph>
            </Col>
            <Col style={{ textAlign: "right" }}>
              {wellTotalsValues.map((wellTotal) => (
                <Paragraph>{formatMoney(wellTotal.wellTotal || 0)}</Paragraph>
              ))}
              <Paragraph>{formatMoney(this.state.contractedWorkTotals.grandTotal || 0)}</Paragraph>
            </Col>
          </Row>
        )) || <Paragraph>Add a well site to see your estimated expense summary.</Paragraph>}

        <Row className="steps-action">
          <Col>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
            <Button style={{ margin: "0 8px" }} onClick={this.props.previousStep}>
              Previous
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ApplicationSectionTwo.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.APPLICATION_FORM)(state),
  })),
  reduxForm({
    form: FORM.APPLICATION_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
  })
)(ApplicationSectionTwo);
