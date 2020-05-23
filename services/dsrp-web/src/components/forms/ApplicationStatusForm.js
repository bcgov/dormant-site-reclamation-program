/* eslint-disable */
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm } from "antd";
import PropTypes from "prop-types";

import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const { Text } = Typography;
const propTypes = {
  onSubmit: PropTypes.func,
};

const defaultProps = {
  onSubmit: () => {},
};

class ApplicationStatusForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Text>
          Changing the application status sends an email to the applicant. Enter any information you
          want them to receive regarding the status change.
        </Text>
        <br />
        <br />
        <Row gutter={48}>
          <Col>
            <Field
              id="note"
              name="note"
              label="Note"
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[required]}
            />
          </Col>
        </Row>
        <div className="right">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button type="secondary">Cancel</Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" style={{ marginLeft: "5px" }}>
            Update and Send
          </Button>
        </div>
      </Form>
    );
  }
}

ApplicationStatusForm.propTypes = propTypes;
ApplicationStatusForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.VIEW_APPLICATION_STATUS_FORM,
})(ApplicationStatusForm);
