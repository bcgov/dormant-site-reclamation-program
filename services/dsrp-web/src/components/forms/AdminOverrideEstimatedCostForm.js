import React from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { currencyMask, formatMoney } from "@/utils/helpers";
import { required, number } from "@/utils/validate";

const { Text } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const AdminOverrideEstimatedCostForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    {/* <Text>Provide a note indicating the reason for editing the application.</Text>
    <br />
    <br /> */}
    <Row gutter={48}>
      <Col>
        <Field
          id="est_cost_override"
          name="est_cost_override"
          label="Estimated Cost Override"
          component={renderConfig.FIELD}
          placeholder="$0.00"
          validate={[number]}
          {...currencyMask}
          onChange={(event, newValue) => {
            if (newValue && newValue.toString().split(".")[0].length > 8) {
              event.preventDefault();
            }
          }}
        />
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
      <Button type="primary" htmlType="submit" style={{ marginLeft: 5 }} loading={props.submitting}>
        Submit
      </Button>
    </div>
  </Form>
);

AdminOverrideEstimatedCostForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADMIN_OVERRIDE_ESTIMATED_COST_FORM,
  enableReinitialize: true,
})(AdminOverrideEstimatedCostForm);
