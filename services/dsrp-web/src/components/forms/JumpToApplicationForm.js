/* eslint-disable */
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button } from "antd";
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

class JumpToApplicationForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col span={20}>
            <Field
              id="guid"
              name="guid"
              label="Application Reference Number"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              component={renderConfig.FIELD}
              validate={[exactLength(36)]}
              {...guidMask}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" htmlType="submit" style={{ marginTop: "30px" }}>
              View Application
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

JumpToApplicationForm.propTypes = propTypes;
JumpToApplicationForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.JUMP_TO_APPLICATION_FORM,
})(JumpToApplicationForm);
