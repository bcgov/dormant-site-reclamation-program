import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Alert } from "antd";
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
  isAdminView: PropTypes.bool.isRequired,
};

class InterimReportForm extends Component {
  render() {
    let interimPaymentStatus = this.props.contractedWorkPayment.contracted_work_payment
      ? this.props.contractedWorkPayment.contracted_work_payment.interim_payment_status_code
      : null;
    const haveInterimPaymentInfo = interimPaymentStatus !== null;
    interimPaymentStatus = "INFORMATION_REQUIRED";

    const haveInterimProgressReport =
      this.props.contractedWorkPayment.contracted_work_payment &&
      this.props.contractedWorkPayment.contracted_work_payment.interim_report !== null;

    const isViewOnly =
      this.props.isAdminView || !haveInterimPaymentInfo || haveInterimProgressReport;

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>Interim Progress Report</Title>

        {!this.props.isAdminView && !haveInterimPaymentInfo && (
          <Paragraph>
            <Alert
              showIcon
              message="You must complete and submit this work item's interim payment information before you can submit its Interim Progress Report."
            />
          </Paragraph>
        )}

        {!this.props.isAdminView && (
          <Paragraph>
            Completion of this form is a requirement for receiving final payment. Once the form has
            been submitted you will be unable to modify it.
          </Paragraph>
        )}

        <Row gutter={48}>
          <Col>
            <Field
              id="interim_report"
              name="interim_report"
              label={
                <>
                  <div>Interim Progress Report (min. 25 - max. 250 characters)</div>
                  <div className="font-weight-normal color-default-font">
                    Briefly describe the work that was reported in the uploaded Interim Evidence of
                    Cost file.
                  </div>
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[required, minLength(25), maxLength(250)]}
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

InterimReportForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CONTRACTED_WORK_INTERIM_REPORT_FORM,
  enableReinitialize: true,
})(InterimReportForm);
