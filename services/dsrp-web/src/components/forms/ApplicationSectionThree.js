import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";

import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const defaultProps = {};

class ApplicationSectionThree extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="review">
          <Field
            id="reviewed_and_verified"
            name="reviewed_and_verified"
            label="I have reviewed and verified that this application's information is correct."
            component={renderConfig.CHECKBOX}
            validate={[required]}
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
})(ApplicationSectionThree);
