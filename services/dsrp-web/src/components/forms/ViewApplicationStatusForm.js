import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button } from "antd";
import PropTypes from "prop-types";
import Paragraph from "antd/lib/typography/Paragraph";
import { renderConfig } from "@/components/common/config";
import { required, exactLength } from "@/utils/validate";
import { guidMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

class ViewApplicationStatusForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Paragraph>
          To View your application, enter your application reference number and request a one-time
          use link. This Link is valid for 4 hours after the request is made. Request a one-time
          link every time you access this application.
        </Paragraph>
        <Row gutter={48}>
          <Col>
            <Field
              id="guid"
              name="guid"
              label="Application Reference Number"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              component={renderConfig.FIELD}
              validate={[required, exactLength(36)]}
              {...guidMask}
            />
            <Button type="primary" htmlType="submit">
              Request Link
            </Button>
          </Col>
        </Row>
        <Row className="steps-action">
          <Col />
        </Row>
      </Form>
    );
  }
}

ViewApplicationStatusForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.VIEW_APPLICATION_STATUS_FORM,
})(ViewApplicationStatusForm);
