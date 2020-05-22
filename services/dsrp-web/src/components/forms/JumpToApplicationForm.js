/* eslint-disable */
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { reset } from "redux-form";
import PropTypes from "prop-types";

import { renderConfig } from "@/components/common/config";
import { exactLength } from "@/utils/validate";
import { guidMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class JumpToApplicationForm extends Component {
  clear = () => {
    this.props.reset(FORM.JUMP_TO_APPLICATION_FORM);
    this.props.onSubmit({ guid: "" });
  };
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col span={16}>
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
              Search
            </Button>
          </Col>
          <Col span={4}>
            <Button type="secondary" style={{ marginTop: "30px" }} onClick={this.clear}>
              clear
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

JumpToApplicationForm.propTypes = propTypes;
JumpToApplicationForm.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reset,
    },
    dispatch
  );

export default compose(
  connect(mapDispatchToProps),
  reduxForm({
    form: FORM.JUMP_TO_APPLICATION_FORM,
  })
)(JumpToApplicationForm);
