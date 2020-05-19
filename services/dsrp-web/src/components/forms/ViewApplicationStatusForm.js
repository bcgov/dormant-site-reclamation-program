/* eslint-disable */
import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";
import PropTypes from "prop-types";

import { renderConfig } from "@/components/common/config";
import { required, exactLength } from "@/utils/validate";
import { guidMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  onChange: PropTypes.func,
};

const defaultProps = {
  onChange: () => {},
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
              Check Status
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ViewApplicationStatusForm.propTypes = propTypes;
ViewApplicationStatusForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.VIEW_APPLICATION_STATUS_FORM,
})(ViewApplicationStatusForm);
