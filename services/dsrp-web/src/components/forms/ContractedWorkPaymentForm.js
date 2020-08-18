import React, { Component } from "react";
import { Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Alert } from "antd";
import { capitalize } from "lodash";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, number, requiredList, date } from "@/utils/validate";
import { currencyMask } from "@/utils/helpers";
import { EXCEL, PDF } from "@/constants/fileTypes";
import { EOC_TEMPLATE } from "@/constants/assets";

const { Title, Text, Paragraph } = Typography;

const propTypes = {
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  paymentType: PropTypes.oneOf(["interim", "final"]),
};

const defaultProps = {
  paymentType: "interim",
};

// eslint-disable-next-line react/prefer-stateless-function
export class ContractedWorkPaymentForm extends Component {
  render() {
    const { paymentType } = this.props;

    const interimPaymentStatus = this.props.contractedWorkPayment.contracted_work_payment
      ? this.props.contractedWorkPayment.contracted_work_payment.interim_payment_status_code
      : "INFORMATION_REQUIRED";

    const finalPaymentStatus = this.props.contractedWorkPayment.contracted_work_payment
      ? this.props.contractedWorkPayment.contracted_work_payment.final_payment_status_code
      : "INFORMATION_REQUIRED";

    const isViewOnly =
      (paymentType === "interim" && interimPaymentStatus !== "INFORMATION_REQUIRED") ||
      (paymentType === "final" &&
        (interimPaymentStatus === "INFORMATION_REQUIRED" ||
          finalPaymentStatus !== "INFORMATION_REQUIRED"));

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>{capitalize(paymentType)} Payment Information</Title>

        <Paragraph>
          In order to process this work item&apos;s <Text strong>{paymentType} payment</Text>, you
          must provide the information below. Upon submitting the form, it will be marked as ready
          for review and you will be <Text strong>unable to edit your submission</Text>. If an issue
          is found with your submission, you will be notified by email and be able to edit your
          submission again. If an issue is not found with your submission, it will approved and
          payment will be sent.
        </Paragraph>

        {paymentType === "interim" && (
          <Paragraph>
            Once you have submitted this work item&apos;s interim payment information, you
            have&nbsp;
            <Text strong>30 days</Text> to complete the Interim Progress Report form available in
            the <Text strong>Interim Progress Report</Text> tab above. Completion of this form is a
            requirement for receiving final payment.
          </Paragraph>
        )}

        {paymentType === "final" && interimPaymentStatus === "INFORMATION_REQUIRED" && (
          <Paragraph>
            <Alert
              showIcon
              message="You must complete and submit this work item's interim payment information before you can submit its final payment information."
            />
          </Paragraph>
        )}

        <Row gutter={48}>
          <Col>
            <Field
              id={`${paymentType}_total_hours_worked_to_date`}
              name={`${paymentType}_total_hours_worked_to_date`}
              label="Total Number of Hours Worked"
              placeholder="0"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id={`${paymentType}_number_of_workers`}
              name={`${paymentType}_number_of_workers`}
              label="Total Number of Workers"
              placeholder="0"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id={`${paymentType}_actual_cost`}
              name={`${paymentType}_actual_cost`}
              label="Evidence of Cost Invoice Amount Total"
              placeholder="$0.00"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
              {...currencyMask}
            />
            {paymentType === "final" && (
              <Field
                id="work_completion_date"
                name="work_completion_date"
                label="Work Completion Date"
                placeholder="YYYY-MM-DD"
                disabled={isViewOnly}
                component={renderConfig.DATE}
                validate={[required, date]}
              />
            )}
            <Field
              id={`${paymentType}_eoc`}
              name={`${paymentType}_eoc`}
              label={
                <>
                  <div>Evidence of Cost</div>
                  Please&nbsp;
                  <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                    download
                  </a>
                  &nbsp;and use the provided Evidence of Cost template.
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.FILE_UPLOAD}
              validate={[requiredList]}
              labelIdle="Upload Evidence of Cost"
              acceptedFileTypesMap={EXCEL}
              allowMultiple={false}
              allowRevert
            />
            {paymentType === "final" && (
              <Field
                id="final_report"
                name="final_report"
                label={
                  <>
                    <div>Final Report</div>
                    Please&nbsp;
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      download
                    </a>
                    &nbsp;and use the provided Final Report template.
                  </>
                }
                disabled={isViewOnly}
                component={renderConfig.FILE_UPLOAD}
                validate={[requiredList]}
                labelIdle="Upload Final Report"
                acceptedFileTypesMap={PDF}
                allowMultiple={false}
                allowRevert
              />
            )}
            <Field
              id={`${paymentType}_submission_confirmation`}
              name={`${paymentType}_submission_confirmation`}
              label={
                <>
                  I certify that the above information is correct and has been reviewed and approved
                  by <Text strong>[insert name here]</Text> and I declare that I have completed all
                  required notifications and activities in accordance with the&nbsp;
                  <a
                    href="https://www.bclaws.ca/civix/document/id/complete/statreg/112_2019"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Dormancy and Shutdown Regulations
                  </a>
                  .
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
              validate={[required]}
            />
            <Paragraph>
              Please keep your records available. If the province requests evidence of cost, it must
              be provided within 30 days.
            </Paragraph>
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

ContractedWorkPaymentForm.propTypes = propTypes;
ContractedWorkPaymentForm.defaultProps = defaultProps;

export default ContractedWorkPaymentForm;
