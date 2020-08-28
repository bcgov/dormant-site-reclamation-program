import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, exactLength } from "@/utils/validate";
import { guidMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";
import Paragraph from "antd/lib/typography/Paragraph";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

class ViewApplicationStatusForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
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
          </Col>
        </Row>
        <Row className="steps-action">
          <Col>
            <Button type="primary" htmlType="submit">
              Request Link
            </Button>
            <Paragraph>
              To View your application, You must request a one-time-use link. This Link be valid for
              4 hours after the request is made.{" "}
            </Paragraph>
          </Col>
        </Row>
      </Form>
    );
  }
}

ViewApplicationStatusForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.VIEW_APPLICATION_STATUS_FORM,
})(ViewApplicationStatusForm);
