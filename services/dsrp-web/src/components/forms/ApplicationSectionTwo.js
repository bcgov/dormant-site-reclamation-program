import React, { Component } from "react";
import { reduxForm, FieldArray } from "redux-form";
import { Row, Col, Typography, Form, Divider, Button, Collapse, Descriptions, Icon } from "antd";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const defaultProps = {};

const createMemberName = (member, name) => `${member}.${name}`

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

const renderWells = ({ fields }) => (
  <>
    <Title level={2}>Well Sites</Title>
    <Row gutter={[48, 48]}>
      <Col span={24}>
        <Collapse bordered={false}>
          {fields.map((member, index) => (
            <Panel
              key={index}
              header={
                <Title level={4}>
                  {/* NOTE: Could update name with the well's name when it is retrieved. */}
                  Well Site #{index + 1}
                  <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
                    Remove Well Site #{index + 1}
                  </Button>
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
                <Title level={4}>Site Conditions</Title>
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
                <Title level={4}>Contracted Work</Title>
                <Paragraph>Enter the estimated cost of every work component your company will perform for this contract.</Paragraph>
                <Row gutter={48}>
                  <Col span={24}>
                    <Collapse bordered={false}>
                      <Panel header="Abandonment">
                        <FormSection name="abandonment">
                        </FormSection>
                      </Panel>
                      <Panel header="Preliminary Site Investigation">
                        <FormSection name="preliminary_site_investigation">
                        </FormSection>
                      </Panel>
                      <Panel header="Detailed Site Investigation">
                        <FormSection name="detailed_site_investigation">
                        </FormSection>
                      </Panel>
                      <Panel header="Remediation">
                        <FormSection name="remediation">
                        </FormSection>
                      </Panel>
                      <Panel header="Reclamation">
                        <FormSection name="reclamation">
                        </FormSection>
                      </Panel>
                    </Collapse>
                    <Paragraph style={{ float: "right" }}>
                      <Text className="color-primary" strong>Grand total:&nbsp;</Text>
                      <Text>$0.00</Text>
                    </Paragraph>
                  </Col>
                </Row>
              </FormSection>
            </Panel>
          ))}
        </Collapse>
      </Col>
    </Row>
    <Button type="primary" onClick={() => fields.push({})}>
      Add Well Site
    </Button>
  </>
);

class ApplicationSectionTwo extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="contract_details">
          <Title level={2}>Contract Information</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Field
                id="random_stuff"
                name="random_stuff"
                label="Random Stuff"
                placeholder="Enter random stuff"
                component={renderConfig.FIELD}
                validate={[required, maxLength(9)]}
              />
            </Col>
          </Row>
        </FormSection>

        <FieldArray name="well_sites" component={renderWells} />

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

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(ApplicationSectionTwo);
