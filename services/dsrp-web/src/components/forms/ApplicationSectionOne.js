import React, { Component } from "react";
import { reduxForm } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const defaultProps = {};

const validate = (values, form) => {
  const errors = {};
  return errors;
};

class ApplicationSectionOne extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="one" ref={(node) => (this.step = node)}>
          <Field
            id="text"
            name="text"
            label="Text"
            placeholder="Enter text"
            component={renderConfig.FIELD}
            validate={[required]}
          />
        </FormSection>
        <Row className="steps-action">
          <Col>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ApplicationSectionOne.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
})(ApplicationSectionOne);
