import React, { Component } from "react";
import { reduxForm, FieldArray, Field, FormSection } from "redux-form";
import { Row, Col, Typography, Form, Button, Collapse, Icon } from "antd";

import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

import PermitHolderSelect from "@/components/forms/PermitHolderSelect";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const defaultProps = {};

const renderSites = ({ fields, meta: { error, submitFailed } }) => (
  <React.Fragment>
    <Title level={2}>Ducks</Title>
    <Row gutter={48}>
      <Col span={24}>{submitFailed && error && <>{error}</>}</Col>
    </Row>
    <Row gutter={[48, 48]}>
      <Col span={24}>
        <Collapse bordered={false}>
          {fields.map((member, index) => (
            <Panel
              key={index}
              header={
                <Title level={4}>
                  Duck #{index + 1}
                  <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
                    <Icon type="close" />
                  </Button>
                </Title>
              }
            >
              <Field
                name={`${member}.first_name`}
                label="First Name"
                placeholder="First Name"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Panel>
          ))}
        </Collapse>
      </Col>
    </Row>
    <Button type="primary" onClick={() => fields.push({})}>
      Add Duck
    </Button>
  </React.Fragment>
);

class ApplicationSectionTwo extends Component {
  render = () => (
    <Form layout="vertical" onSubmit={this.props.handleSubmit}>
      <FormSection name="contract_details">
        <Title level={2}>Contact Information</Title>
        <Row gutter={48}>
          <Col span={24}>
            <Field
              id="organization_id"
              name="organization_id"
              label="Permit Holder"
              placeholder="Search for permit holder for whom this work will be performed"
              component={PermitHolderSelect}
              validate={[required]}
            />
          </Col>
        </Row>
      </FormSection>

      <FormSection name="add_sites">
        <FieldArray name="sites" component={renderSites} />
      </FormSection>

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

ApplicationSectionTwo.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(ApplicationSectionTwo);
