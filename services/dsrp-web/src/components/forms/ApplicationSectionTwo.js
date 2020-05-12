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

class ApplicationSectionTwo extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="two">
          <Field
            id="random_stuff"
            name="random_stuff"
            label="Random Stuff"
            placeholder="Enter random stuff"
            component={renderConfig.FIELD}
            validate={[required, maxLength(9)]}
          />
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
  validate,
})(ApplicationSectionTwo);
