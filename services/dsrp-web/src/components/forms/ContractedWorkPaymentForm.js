import React, { Component } from "react";
import { Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Alert } from "antd";
import { capitalize, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, number, notZero, requiredList, date } from "@/utils/validate";
import { currencyMask, metersMask } from "@/utils/helpers";
import { EXCEL, PDF } from "@/constants/fileTypes";
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

const renderReportingFields = (workType, isViewOnly) => {
  const workTypeName =
    workType === "preliminary_site_investigation" || workType === "detailed_site_investigation"
      ? "Site Investigation"
      : capitalize(workType);

  return (
    <Row className="final-report-fields">
      <Col>
        <Field
          id="surface_landowner"
          name="surface_landowner"
          label="Surface Landowner"
          placeholder="Select an option"
          disabled={isViewOnly}
          component={renderConfig.SELECT}
          validate={[required]}
          format={null}
          data={[
            { value: "Crown", label: "Crown" },
            { value: "Freehold", label: "Freehold" },
            { value: "Both", label: "Both" },
          ]}
        />

        {workType === "abandonment" && (
          <>
            <Field
              id="abandonment_cut_and_capped_completed"
              name="abandonment_cut_and_capped_completed"
              label="Was Well Abandonment completed to Cut and Capped?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
            <Field
              id="abandonment_notice_of_operations_submitted"
              name="abandonment_notice_of_operations_submitted"
              label="Was a Notice of Operations (NOO) form submission completed using the OGC eSubmission portal?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
            <Field
              id="abandonment_meters_of_pipeline_abandoned"
              name="abandonment_meters_of_pipeline_abandoned"
              label="If pipeline was abandoned as part of the Dormant Site Abandonment process, provide the length (approximate) of pipeline abandoned (meters)."
              placeholder="Not applicable"
              disabled={isViewOnly}
              validate={[notZero]}
              component={renderConfig.FIELD}
              {...metersMask}
            />
          </>
        )}

        {workType === "remediation" && (
          <>
            <Field
              id="remediation_identified_contamination_meets_standards"
              name="remediation_identified_contamination_meets_standards"
              label="Was all identified contamination relating to the Dormant Site remediated to meet Contaminated Sites Regulations remediation standards or risk-based standards relevant to the Site?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
            <Field
              id="remediation_type_of_document_submitted"
              name="remediation_type_of_document_submitted"
              label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[required]}
              format={null}
              data={[
                { value: "COR_P1", label: "Yes - Certificate of Restoration (Part 1)" },
                { value: "DSAF", label: "Yes - Dormancy Site Assessment Form" },
                { value: "NONE", label: "No" },
              ]}
            />
            <Field
              id="remediation_reclaimed_to_meet_cor_p1_requirements"
              name="remediation_reclaimed_to_meet_cor_p1_requirements"
              label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 1) requirements?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
          </>
        )}

        {workType === "reclamation" && (
          <>
            <Field
              id="reclamation_reclaimed_to_meet_cor_p2_requirements"
              name="reclamation_reclaimed_to_meet_cor_p2_requirements"
              label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 2) requirements?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
            <Field
              id="reclamation_surface_reclamation_criteria_met"
              name="reclamation_surface_reclamation_criteria_met"
              label="Has the surface reclamation been completed to match surrounding natural contour and revegetated with ecologically suitable species?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
          </>
        )}

        {(workType === "preliminary_site_investigation" ||
          workType === "detailed_site_investigation") && (
          <>
            <Field
              id="site_investigation_type_of_document_submitted"
              name="site_investigation_type_of_document_submitted"
              label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[required]}
              format={null}
              data={[
                { value: "COR_P1", label: "Yes - Certificate of Restoration (Part 1)" },
                { value: "DSAF", label: "Yes - Dormancy Site Assessment Form" },
                { value: "NONE", label: "No" },
              ]}
            />
            <Field
              id="site_investigation_concerns_identified"
              name="site_investigation_concerns_identified"
              label="Were any concerns identified through site investigation that are specific to other interested parties (e.g. landowners, municipalities, regional districts or local Indigenous nations)?"
              disabled={isViewOnly}
              component={renderConfig.CHECKBOX}
            />
          </>
        )}

        <Field
          id="reclamation_was_achieved"
          name="reclamation_was_achieved"
          label="Level of Reclamation achieved for the Dormant Site"
          placeholder="Select an option"
          disabled={isViewOnly}
          component={renderConfig.SELECT}
          validate={[required]}
          format={(value) => (value ? value.toString() : undefined)}
          data={[
            { value: "true", label: `${workTypeName} Complete` },
            { value: "false", label: `${workTypeName} Not Complete` },
          ]}
        />
      </Col>
    </Row>
  );
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

        {paymentType === "final" && interimPaymentStatus === "INFORMATION_REQUIRED" && (
          <Paragraph>
            <Alert
              showIcon
              message="You must complete and submit this work item's interim payment information before you can submit its final payment information."
            />
          </Paragraph>
        )}

        <Paragraph>
          In order for your <Text strong>{paymentType} payment request</Text> to be processed, you
          must complete this form with your Evidence of Cost.
        </Paragraph>

        {paymentType === "interim" && (
          <Paragraph>
            The Interim Progress Report must be submitted within&nbsp;
            <Text strong>30 days</Text> of requesting an interim payment.
          </Paragraph>
        )}

        <Paragraph>
          Once you submit your request, you cannot edit it.
          <br />
          If you have any questions, contact&nbsp;
          <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>.
        </Paragraph>

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
                    Fill in the&nbsp;
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
                    Download previously uploaded Evidence of Cost
                  </LinkButton>
                )) || <></>
              }
            />
            {paymentType === "final" && (
              <>
                <Field
                  id="final_report"
                  name="final_report"
                  label={
                    <>
                      <div>Final Report</div>
                      <div className="font-weight-normal">
                        Fill in the&nbsp;
                        <a href={FINAL_REPORT_TEMPLATE} target="_blank" rel="noopener noreferrer">
                          Final Report template
                        </a>
                        &nbsp;and upload it as a PDF here.
                        {existingFinalReport &&
                          " If your original Final Report document has not changed, you do not need to re-upload it."}
                      </div>
                    </>
                  }
                  disabled={isViewOnly}
                  component={renderConfig.FILE_UPLOAD}
                  validate={existingFinalReport ? [] : [requiredList]}
                  acceptedFileTypesMap={PDF}
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
                        Download previously uploaded Final Report
                      </LinkButton>
                    )) || <></>
                  }
                />
                <Form.Item
                  label={
                    <>
                      <div>Final Report - Key Reporting Data</div>
                      <div className="font-weight-normal">
                        Enter in the below form fields as they are provided in the uploaded Final
                        Report document.
                      </div>
                    </>
                  }
                >
                  {renderReportingFields(
                    this.props.contractedWorkPayment.contracted_work_type,
                    isViewOnly
                  )}
                </Form.Item>
              </>
            )}

            <Form.Item label="Certification">
              <Field
                id={`${paymentType}_submission_confirmation`}
                name={`${paymentType}_submission_confirmation`}
                label="I certify that the above information is correct and has been reviewed and approved by a senior officer of the recipient organization."
                disabled={isViewOnly}
                component={renderConfig.CHECKBOX}
                validate={[required]}
              />
              <Field
                id={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                name={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                label={
                  <>
                    I declare that all required notifications and activities have been submitted in
                    accordance with the&nbsp;
                    <a
                      href="https://www.bclaws.ca/civix/document/id/complete/statreg/112_2019"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Dormancy and Shutdown Regulation
                    </a>
                    .
                  </>
                }
                disabled={isViewOnly}
                component={renderConfig.CHECKBOX}
                validate={[required]}
              />
              <Field
                id={`${paymentType}_submitter_name`}
                name={`${paymentType}_submitter_name`}
                placeholder="Type Your Name"
                disabled={isViewOnly}
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>

            <Paragraph>
              Keep all records of original invoices for this work. If they are requested by the
              Province, you will be required to provide them within 30 days of the request.
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
