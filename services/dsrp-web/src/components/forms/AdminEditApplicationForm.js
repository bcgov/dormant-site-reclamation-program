import React from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const { Text } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const AdminEditApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Text>Foobar biz baz bizzle bazzle</Text>
    <br />
    <br />
    <Row gutter={48}>
      <Col>
        <Field id="note" name="edit_note" label="Note" component={renderConfig.AUTO_SIZE_FIELD} />
      </Col>
    </Row>
    <div className="right">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
        disabled={props.submitting}
      >
        <Button type="secondary" disabled={props.submitting}>
          Cancel
        </Button>
      </Popconfirm>
      <Button
        type="primary"
        htmlType="submit"
        style={{ marginLeft: "5px" }}
        loading={props.submitting}
      >
        Update
      </Button>
    </div>
  </Form>
);

AdminEditApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADMIN_EDIT_APPLICATION_FORM,
})(AdminEditApplicationForm);
