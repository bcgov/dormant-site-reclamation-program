import React, { Component } from "react";
import { reduxForm, Field, getFormValues } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm } from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { lowerCase } from "lodash";
import { required, maxLength } from "@/utils/validate";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { getContractedWorkTypeOptionsHash } from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import AdminChangeContractedWorkPaymentStatusApprovedForm from "@/components/forms/AdminChangeContractedWorkPaymentStatusApprovedForm";

const { Text, Title } = Typography;

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkPaymentStatus: PropTypes.string.isRequired,
  contractedWorkPaymentType: PropTypes.string.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  contractedWorkTypeOptionsHash: PropTypes.any.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export class AdminChangeContractedWorkPaymentStatusForm extends Component {
  render() {
    const contractedWorkTypeFormId = lowerCase(this.props.contractedWorkPaymentType);

    const renderFormStatusInformationRequired = () => (
      <>
        <Field
          id="note"
          name="note"
          label={
            <>
              <Text className="color-primary" strong>
                Note
              </Text>
              <br />
              <Text>
                Provide a note indicating the reason for setting this work item's&nbsp;
                <Text strong>{contractedWorkTypeFormId} payment status</Text> back to Information
                Required. This note will be sent along in an email to the applicant to notify them.
              </Text>
            </>
          }
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[required, maxLength(65536)]}
        />
      </>
    );

    const renderFormStatusReadyForReview = () => <></>;

    const renderFormStatusApproved = () => (
      <AdminChangeContractedWorkPaymentStatusApprovedForm
        contractedWork={this.props.contractedWork}
        contractedWorkPaymentType={this.props.contractedWorkPaymentType}
      />
    );

    let renderStatusForm = null;
    switch (this.props.contractedWorkPaymentStatus) {
      case "INFORMATION_REQUIRED":
        renderStatusForm = renderFormStatusInformationRequired;
        break;
      case "READY_FOR_REVIEW":
        renderStatusForm = renderFormStatusReadyForReview;
        break;
      case "APPROVED":
        renderStatusForm = renderFormStatusApproved;
        break;
      default:
        throw new Error("Unknown contracted work payment status code received!");
    }

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col>{renderStatusForm()}</Col>
        </Row>
        <div className="right">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
          >
            <Button type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginLeft: 5 }}
            loading={this.props.submitting}
          >
            Update Status to&nbsp;
            {
              this.props.contractedWorkPaymentStatusOptionsHash[
                this.props.contractedWorkPaymentStatus
              ]
            }
          </Button>
        </div>
      </Form>
    );
  }
}

AdminChangeContractedWorkPaymentStatusForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS_FORM)(state),
  contractedWorkTypeOptionsHash: getContractedWorkTypeOptionsHash(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS_FORM,
    enableReinitialize: true,
  })
)(AdminChangeContractedWorkPaymentStatusForm);
