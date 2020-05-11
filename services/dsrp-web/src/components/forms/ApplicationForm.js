import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import PropTypes from "prop-types";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export class ApplicationForm extends Component {
  state = { submitting: false };

  handleReset = () => {
    resetForm(FORM.APPLICATION_FORM);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
            <Form.Item>
              <Field
                id="name"
                name="name"
                label="Name"
                placeholder="Type"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_no"
                name="permit_no"
                label="Permit number*"
                component={renderConfig.FIELD}
                validate={[required, maxLength(9)]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={() => {
              this.handleReset();
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.state.submitting}
          >
            Submit
          </Button>
        </div>
      </Form>
    );
  }
}

ApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  onSubmitSuccess: resetForm(FORM.APPLICATION_FORM),
  touchOnBlur: false,
})(ApplicationForm);
