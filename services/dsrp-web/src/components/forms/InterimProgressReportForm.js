import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, minLength, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const { Title, Paragraph } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

class InterimProgressReportForm extends Component {
  render() {
    const interimPaymentStatus = this.props.contractedWorkPayment.contracted_work_payment
      ? this.props.contractedWorkPayment.contracted_work_payment.interim_payment_status_code
      : "INFORMATION_REQUIRED";

    const isViewOnly = interimPaymentStatus === "APPROVED";

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>Interim Progress Report</Title>

        <Paragraph>Completion of this form is a requirement for receiving final payment.</Paragraph>

        <Row gutter={48}>
          <Col>
            <Field
              id="interim_progress_report"
              name="interim_progress_report"
              label={
                <>
                  <div>Interim Progress Report</div>
                  Please briefly describe the work that was completed as it relates to the contents
                  of the provided interim Evidence of Cost document. Must be between 25 and 250
                  characters.
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[required, minLength(25), maxLength(250)]}
            />
            <Field
              id="interim_progress_report_submission_confirmation"
              name="interim_progress_report_submission_confirmation"
              label="I certify that the information provided in the Interim Progress Report is true and correct."
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
              validate={[required]}
            />
          </Col>
        </Row>
        <div className="right">
          {(isViewOnly && (
            <Button type="primary" onClick={this.props.closeModal}>
              Close
            </Button>
          )) || (
            <>
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
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
                Submit
              </Button>
            </>
          )}
        </div>
      </Form>
    );
  }
}

InterimProgressReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CONTRACTED_WORK_INTERIM_PROGRESS_REPORT_FORM,
  enableReinitialize: true,
})(InterimProgressReportForm);
