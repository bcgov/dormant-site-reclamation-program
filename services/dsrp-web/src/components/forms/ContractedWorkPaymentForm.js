import React, { Component } from "react";
import { Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Alert } from "antd";
import { capitalize, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, number, requiredList, date } from "@/utils/validate";
import { currencyMask } from "@/utils/helpers";
import { EXCEL, DOCX } from "@/constants/fileTypes";
import { EOC_TEMPLATE, FINAL_REPORT_TEMPLATE } from "@/constants/assets";
import { DATE_FORMAT, HELP_EMAIL } from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";

const { Title, Text, Paragraph } = Typography;

const propTypes = {
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
  applicationSummary: CustomPropTypes.applicationSummary.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isAdminView: PropTypes.bool.isRequired,
  paymentType: PropTypes.oneOf(["interim", "final"]),
};

const defaultProps = {
  paymentType: "interim",
};

// eslint-disable-next-line react/prefer-stateless-function
export class ContractedWorkPaymentForm extends Component {
  render() {
    const { paymentType, contractedWorkPayment } = this.props;
    const paymentInfo = contractedWorkPayment.contracted_work_payment;

    const interimPaymentStatus = paymentInfo
      ? paymentInfo.interim_payment_status_code
      : "INFORMATION_REQUIRED";

    const finalPaymentStatus = paymentInfo
      ? paymentInfo.final_payment_status_code
      : "INFORMATION_REQUIRED";

    const isViewOnly =
      this.props.isAdminView ||
      (paymentType === "interim" && interimPaymentStatus !== "INFORMATION_REQUIRED") ||
      (paymentType === "final" &&
        (interimPaymentStatus === "INFORMATION_REQUIRED" ||
          finalPaymentStatus !== "INFORMATION_REQUIRED"));

    const existingEvidenceOfCost = paymentInfo
      ? paymentType === "interim"
        ? isEmpty(paymentInfo.interim_eoc_document)
          ? null
          : paymentInfo.interim_eoc_document
        : paymentType === "final"
        ? isEmpty(paymentInfo.final_eoc_document)
          ? null
          : paymentInfo.final_eoc_document
        : null
      : null;

    const existingFinalReport = paymentInfo
      ? isEmpty(paymentInfo.final_report_document)
        ? null
        : paymentInfo.final_report_document
      : null;

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>{capitalize(paymentType)} Payment Form</Title>

        {!this.props.isAdminView &&
          paymentType === "final" &&
          interimPaymentStatus === "INFORMATION_REQUIRED" && (
            <Paragraph>
              <Alert
                showIcon
                message="You must complete and submit this work item's interim payment information before you can submit its final payment information."
              />
            </Paragraph>
          )}

        {!this.props.isAdminView && (
          <Paragraph>
            In order for your <Text strong>{paymentType} payment request</Text> to be processed, you
            must complete this form with your Evidence of Cost.
          </Paragraph>
        )}

        {!this.props.isAdminView && paymentType === "interim" && (
          <Paragraph>
            The Interim Progress Report must be submitted within&nbsp;
            <Text strong>30 days</Text> of requesting an interim payment.
          </Paragraph>
        )}

        {!this.props.isAdminView && (
          <Paragraph>
            Once you submit your request, you cannot edit it. If you have any questions,
            contact&nbsp;
            <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>.
          </Paragraph>
        )}

        <Row gutter={48}>
          <Col>
            <Field
              id={`${paymentType}_total_hours_worked_to_date`}
              name={`${paymentType}_total_hours_worked_to_date`}
              label="Total Hours Worked"
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
              label="Evidence of Cost Total"
              placeholder="$0.00"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
              {...currencyMask}
              onChange={(event, newValue) => {
                if (newValue && newValue.toString().split(".")[0].length > 8) {
                  event.preventDefault();
                }
              }}
            />
            {paymentType === "final" && (
              <Field
                id="work_completion_date"
                name="work_completion_date"
                label="Work Completion Date"
                placeholder={DATE_FORMAT}
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
                  <div>Evidence of Cost Upload</div>
                  <div className="font-weight-normal">
                    Fill in the &nbsp;
                    <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Evidence of Cost template
                    </a>
                    &nbsp;and upload it here.
                    {existingEvidenceOfCost &&
                      " If your original Evidence of Cost document has not changed, you do not need to re-upload it."}
                  </div>
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.FILE_UPLOAD}
              validate={existingEvidenceOfCost ? [] : [requiredList]}
              acceptedFileTypesMap={EXCEL}
              allowMultiple={false}
              allowRevert
              renderAfterInput={() =>
                (existingEvidenceOfCost && (
                  <LinkButton
                    onClick={() =>
                      downloadDocument(
                        this.props.contractedWorkPayment.application_guid,
                        existingEvidenceOfCost.application_document_guid,
                        existingEvidenceOfCost.document_name
                      )
                    }
                  >
                    Download Uploaded Evidence of Cost
                  </LinkButton>
                )) || <></>
              }
            />
            {paymentType === "final" && (
              <Field
                id="final_report"
                name="final_report"
                label={
                  <>
                    <div>Final Report</div>
                    <div className="font-weight-normal">
                      Please&nbsp;
                      <a href={FINAL_REPORT_TEMPLATE} target="_blank" rel="noopener noreferrer">
                        download
                      </a>
                      &nbsp;and use the provided Final Report template and upload it as a PDF.
                      {existingFinalReport &&
                        " If your original Final Report document has not changed, you do not need to re-upload it."}
                    </div>
                  </>
                }
                disabled={isViewOnly}
                component={renderConfig.FILE_UPLOAD}
                validate={existingFinalReport ? [] : [requiredList]}
                acceptedFileTypesMap={DOCX}
                allowMultiple={false}
                allowRevert
                renderAfterInput={() =>
                  (existingFinalReport && (
                    <LinkButton
                      onClick={() =>
                        downloadDocument(
                          this.props.contractedWorkPayment.application_guid,
                          existingFinalReport.application_document_guid,
                          existingFinalReport.document_name
                        )
                      }
                    >
                      Download Uploaded Final Report
                    </LinkButton>
                  )) || <></>
                }
              />
            )}

            {!isViewOnly && (
              <>
                <Field
                  id={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                  name={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                  label={
                    <>
                      I declare that I have completed all required notifications and activities in
                      accordance with the&nbsp;
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
                <Field
                  id={`${paymentType}_submission_confirmation`}
                  name={`${paymentType}_submission_confirmation`}
                  label={
                    <>
                      I certify that the above information is correct and has been reviewed and
                      approved by <Text strong>{this.props.applicationSummary.applicant_name}</Text>
                      .
                    </>
                  }
                  disabled={isViewOnly}
                  component={renderConfig.CHECKBOX}
                  validate={[required]}
                />
              </>
            )}

            {!this.props.isAdminView && (
              <Paragraph>
                Please keep your records available. If the province requests evidence of cost, it
                must be provided within 30 days.
              </Paragraph>
            )}
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
