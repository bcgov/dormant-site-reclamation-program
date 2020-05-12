import React, { Component } from "react";
import { reduxForm, FieldArray } from "redux-form";
import { Row, Col, Typography, Form, Button, Divider } from "antd";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const { Text, Paragraph, Title } = Typography;

const defaultProps = {};

const renderSites = ({ fields, meta: { error, submitFailed } }) => (
  <>
    <Title level={2}>Ducks</Title>
    <Row gutter={48}>
      <Col span={24}>{submitFailed && error && <>{error}</>}</Col>
    </Row>
    <Row gutter={[48, 48]}>
      {fields.map((member, index) => (
        <Col span={24} key={index}>
          <Title level={4}>
            Duck #{index + 1}
            <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
              Remove Duck
            </Button>
          </Title>
          <Field
            name={`${member}.first_name`}
            label="First Name"
            placeholder="First Name"
            component={renderConfig.FIELD}
            validate={[required]}
          />
        </Col>
      ))}
    </Row>
    <Button type="primary" onClick={() => fields.push({})}>
      Add Duck
    </Button>
  </>
);

class ApplicationSectionTwo extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="contract_details">
          <Title level={2}>Duck Details</Title>
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
}

ApplicationSectionTwo.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(ApplicationSectionTwo);
