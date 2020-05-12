import React, { Component } from "react";
import { reduxForm , Field, FormSection } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";

import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const defaultProps = {};

const validate = (values, form) => {
  const errors = {};
  return errors;
};

class ApplicationSectionThree extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="three">
          <Field
            id="date"
            name="date"
            label="Date"
            placeholder="Select date"
            component={renderConfig.DATE}
            validate={[required, dateNotInFuture]}
          />
        </FormSection>
        <Row className="steps-action">
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.props.submitting || this.props.pristine}
            >
              Submit
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

ApplicationSectionThree.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
})(ApplicationSectionThree);
