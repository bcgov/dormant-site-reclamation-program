import React from "react";
import { reduxForm, Field, getFormValues } from "redux-form";
import { compose } from "redux";
import { connect } from "react-redux";
import { Row, Col, Form, Button, Typography, Popconfirm, Descriptions } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import { currencyMask, formatMoney } from "@/utils/helpers";
import { number } from "@/utils/validate";

const { Text } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  contractedWork: PropTypes.any.isRequired,
  formValues: PropTypes.any.isRequired,
};

export const AdminOverrideEstimatedCostForm = (props) => {
  const estimatedCostOverride =
    props.formValues?.est_cost_override !== null ? props.formValues?.est_cost_override : null;
  let sharedCost = null;
  if (estimatedCostOverride !== null) {
    const maxSharedCost = 100000;
    sharedCost = (estimatedCostOverride / 2).toFixed(2);
    sharedCost = sharedCost > maxSharedCost ? maxSharedCost : sharedCost;
  }

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Text>
        Override the Estimated Cost for this work item. This value will be used in all calculations
        going forward for this work item.
      </Text>
      <br />
      <br />
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
      <Descriptions column={1}>
        <Descriptions.Item label="Applicant's Estimated Cost">
          {formatMoney(props.contractedWork.est_cost)}
        </Descriptions.Item>
        <Descriptions.Item label="Estimated Shared Cost Override">
          {sharedCost !== null ? formatMoney(sharedCost) : Strings.NA}
        </Descriptions.Item>
      </Descriptions>
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
          style={{ marginLeft: 5 }}
          loading={props.submitting}
        >
          Submit
        </Button>
      </div>
    </Form>
  );
};

AdminOverrideEstimatedCostForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_OVERRIDE_ESTIMATED_COST_FORM)(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.ADMIN_OVERRIDE_ESTIMATED_COST_FORM,
    enableReinitialize: true,
  })
)(AdminOverrideEstimatedCostForm);
