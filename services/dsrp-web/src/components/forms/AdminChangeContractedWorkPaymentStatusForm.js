import React, { Component } from "react";
import { reduxForm, Field, getFormValues } from "redux-form";
import {
  Row,
  Col,
  Alert,
  Form,
  Button,
  Typography,
  Popconfirm,
  Descriptions,
  Tabs,
  Table,
} from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { lowerCase, isEmpty, isEqual, capitalize } from "lodash";
import { formatMoney, currencyMask, formatDate } from "@/utils/helpers";
import { required, maxLength } from "@/utils/validate";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import {
  getContractedWorkTypeOptionsHash,
  getContractedWorkPaymentStatusOptionsHash,
  getDropdownContractedWorkPaymentStatusOptions,
} from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import { toolTip } from "@/components/admin/ApplicationTable";
import { CONTRACTED_WORK_PAYMENT_STATUS } from "@/constants/payments";
import * as Payment from "@/utils/paymentHelper";

const { Text, Title } = Typography;

const { TabPane } = Tabs;

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  contractedWorkTypeOptionsHash: PropTypes.any.isRequired,
  dropdownContractedWorkPaymentStatusOptions: PropTypes.any.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const validateFormApprovedAmount = (
  paymentType,
  interimApprovedAmount,
  finalApprovedAmount,
  interimEstSharedCost,
  finalEstSharedCost,
  interimHalfEocTotal,
  finalHalfEocTotal
) => (value) => {
  interimApprovedAmount = paymentType === "INTERIM" ? value : interimApprovedAmount;
  finalApprovedAmount = paymentType === "FINAL" ? value : finalApprovedAmount;
  const interimLostFunds = interimEstSharedCost - interimApprovedAmount;
  const finalEligibleAmount = finalEstSharedCost + interimLostFunds;
  const finalLostFunds = finalEligibleAmount - finalApprovedAmount;

  if (paymentType === "INTERIM") {
    if (value > interimHalfEocTotal) {
      return `Cannot overpay on half of supplied interim EoC total of ${formatMoney(
        interimHalfEocTotal
      )}`;
    }

    if (interimLostFunds.toFixed(2) < 0) {
      return `Cannot overpay on agreed interim payment amount of ${formatMoney(
        interimEstSharedCost
      )}`;
    }
  }

  if (paymentType === "FINAL") {
    if (value > finalHalfEocTotal) {
      return `Cannot overpay on half of supplied final EoC total of ${formatMoney(
        finalHalfEocTotal
      )}`;
    }

    if (finalLostFunds.toFixed(2) < 0) {
      return `Cannot overpay on agreed final payment amount (plus carry-over from unused interim funds) of ${formatMoney(
        finalEligibleAmount
      )}`;
    }
  }

  return undefined;
};

const validateStatus = (paymentType, contractedWorkPayment) => (value) => {
  if (
    paymentType === "FINAL" &&
    value === "APPROVED" &&
    (!contractedWorkPayment || !contractedWorkPayment.interim_paid_amount)
  ) {
    return "Cannot update the status to Approved unless the interim payment has been approved before.";
  }

  if (
    paymentType === "FINAL" &&
    value === "APPROVED" &&
    (!contractedWorkPayment || !contractedWorkPayment.interim_report)
  ) {
    return "Cannot update the status to Approved unless the Interim Report has been submitted.";
  }

  return undefined;
};

export class AdminChangeContractedWorkPaymentStatusForm extends Component {
  state = {
    currentActiveTab: "INTERIM",
    selectedInterimStatus: this.props.contractedWork.contracted_work_payment
      ? this.props.contractedWork.contracted_work_payment.interim_payment_status_code
      : CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED,
    selectedFinalStatus: this.props.contractedWork.contracted_work_payment
      ? this.props.contractedWork.contracted_work_payment.final_payment_status_code
      : CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED,
  };

  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps.formValues, this.props.formValues) ||
    !isEqual(nextState, this.state) ||
    nextProps.submitting !== this.props.submitting;

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues && !isEqual(nextProps.formValues, this.props.formValues)) {
      this.setState({
        selectedInterimStatus: nextProps.formValues.interim_payment_status_code,
        selectedFinalStatus: nextProps.formValues.final_payment_status_code,
      });
    }
  };

  handleTabChange = (activeKey) => this.setState({ currentActiveTab: activeKey });

  render() {
    const contractedWork = this.props.contractedWork;
    const contractedWorkPayment = contractedWork.contracted_work_payment || {};
    const contractedWorkPaymentExists = !isEmpty(contractedWorkPayment);

    const workType = this.props.contractedWork.contracted_work_type;
    const workTypeName =
      workType === "preliminary_site_investigation" || workType === "detailed_site_investigation"
        ? "Site Investigation"
        : capitalize(workType);

    const renderStatusSelectField = (paymentType) => (
      <Field
        id={`${lowerCase(paymentType)}_payment_status_code`}
        name={`${lowerCase(paymentType)}_payment_status_code`}
        label={`${capitalize(paymentType)} Status`}
        component={renderConfig.SELECT}
        data={this.props.dropdownContractedWorkPaymentStatusOptions}
        format={null}
        validate={[required, validateStatus(paymentType, contractedWorkPayment)]}
      />
    );

    const formatBooleanField = (value) =>
      value === null ? Strings.DASH : value === true ? "Yes" : "No";

    const formatDocSubmitted = (value) =>
      value === null
        ? Strings.DASH
        : value === "NONE"
        ? "No"
        : value === "COR_P1"
        ? "Yes - Certificate of Restoration (Part 1)"
        : "Yes - Dormancy Site Assessment Form";

    const columns = [
      {
        title: "Request Step",
        dataIndex: "payment_type",
        render: (text) => <div>{<Text strong>{text}</Text>}</div>,
      },
      {
        title: (
          <>
            Estimated Contribution
            {toolTip(
              `The estimated contribution based on applicant's original estimates. Breakdown is ${Payment.firstPercent}%, ${Payment.interimPercent}%, and ${Payment.finalPercent}%.`
            )}
          </>
        ),
        dataIndex: "payment_estimated_shared_cost",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text)}</div>,
      },
      {
        title: "EoC Total",
        dataIndex: "eoc_total_amount",
        className: "table-column-right-align",
        render: (text, record) => (
          <div>
            {(text &&
              (((record.payment_type === "Interim" || record.payment_type === "Final") && (
                <LinkButton
                  onClick={() =>
                    downloadDocument(
                      this.props.contractedWork.application_guid,
                      record.eoc_document.application_document_guid,
                      record.eoc_document.document_name
                    )
                  }
                >
                  {formatMoney(text)}
                </LinkButton>
              )) ||
                formatMoney(text))) ||
              Strings.NA}
          </div>
        ),
      },
      {
        title: "50% of EoC Total",
        dataIndex: "half_eoc_total_amount",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text) || Strings.NA}</div>,
      },
      {
        title: (
          <>
            Maximum Contribution
            {toolTip(
              "The maximum amount that the applicant can receive for the Initial, Interim, or Final payment."
            )}
          </>
        ),
        dataIndex: "maximum_approved_amount",
        className: "table-column-right-align",
        render: (text) => <div>{(text && formatMoney(text)) || Strings.NA}</div>,
      },
      {
        title: (
          <>Financial Contribution{toolTip("The approved amount to be paid for the work item.")}</>
        ),
        dataIndex: "approved_amount",
        className: "table-column-right-align",
        render: (text, record) => (
          <div>
            {record.is_selected_type && record.previous_amount && (
              <Text delete>
                {formatMoney(record.previous_amount)}
                <br />
              </Text>
            )}
            <Text {...(record.is_selected_type ? { strong: true } : {})}>
              {formatMoney(text) || (record.is_selected_type ? formatMoney(0) : Strings.NA)}
            </Text>
          </div>
        ),
      },
      {
        title: (
          <>
            Balance
            {toolTip(
              "The difference between the Maximum and Financial Contribution. If there is a balance for the Interim payment, this amount is added to the Maximum Contribution for the Final payment."
            )}
          </>
        ),
        dataIndex: "lost_funds",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text || 0)}</div>,
      },
    ];

    const formInterimApprovedAmount =
      this.props.formValues && this.props.formValues.interim_approved_amount
        ? parseFloat(this.props.formValues.interim_approved_amount)
        : null;
    const formFinalApprovedAmount =
      this.props.formValues && this.props.formValues.final_approved_amount
        ? parseFloat(this.props.formValues.final_approved_amount)
        : null;

    const getTypeEstSharedCost = (percent, estSharedCost) => estSharedCost * (percent / 100);
    const getTypeMaxEligibleAmount = (eocTotalAmount) => eocTotalAmount * 0.5;

    // Initial payment calculations
    const firstEstSharedCost = Payment.getFirstSharedCost(contractedWork.estimated_shared_cost);

    // Interim payment calculations
    const interimEstSharedCost = Payment.getInterimSharedCost(contractedWork.estimated_shared_cost);

    const currentInterimApprovedAmount = contractedWorkPayment.interim_paid_amount
      ? parseFloat(contractedWorkPayment.interim_paid_amount)
      : null;
    const interimActualCost = contractedWorkPayment.interim_actual_cost
      ? parseFloat(contractedWorkPayment.interim_actual_cost)
      : null;
    const interimHalfEocTotal = interimActualCost
      ? getTypeMaxEligibleAmount(interimActualCost)
      : null;
    const interimApprovedAmount =
      this.state.currentActiveTab === "INTERIM" && this.state.selectedInterimStatus === "APPROVED"
        ? formInterimApprovedAmount
          ? formInterimApprovedAmount
          : null
        : currentInterimApprovedAmount
        ? currentInterimApprovedAmount
        : null;
    const interimLostFunds = Math.max(interimEstSharedCost - interimApprovedAmount, 0);
    const interimMaxApprovedAmount = Math.min(interimEstSharedCost, interimHalfEocTotal);

    // Final payment calculations
    const finalEstSharedCost = Payment.getFinalSharedCost(contractedWork.estimated_shared_cost);

    const currentFinalApprovedAmount = contractedWorkPayment.final_paid_amount
      ? parseFloat(contractedWorkPayment.final_paid_amount)
      : null;
    const finalActualCost = contractedWorkPayment.final_actual_cost
      ? parseFloat(contractedWorkPayment.final_actual_cost)
      : null;
    const finalHalfEocTotal = finalActualCost ? getTypeMaxEligibleAmount(finalActualCost) : null;
    const finalApprovedAmount =
      this.state.currentActiveTab === "FINAL" && this.state.selectedFinalStatus === "APPROVED"
        ? formFinalApprovedAmount
          ? formFinalApprovedAmount
          : null
        : currentFinalApprovedAmount
        ? currentFinalApprovedAmount
        : null;
    const finalLostFunds = finalEstSharedCost - finalApprovedAmount;
    const finalEligibleAmount = finalEstSharedCost + interimLostFunds;
    const finalMaxApprovedAmount = Math.min(finalEligibleAmount, finalHalfEocTotal);

    const dataSource = [
      {
        key: "initial",
        is_selected_type: null,
        previous_amount: null,
        payment_type: "Initial",
        payment_percent: `${Payment.firstPercent}%`,
        estimated_shared_cost: contractedWork.estimated_shared_cost,
        payment_estimated_shared_cost: firstEstSharedCost,
        eoc_document: null,
        eoc_total_amount: null,
        half_eoc_total_amount: null,
        maximum_approved_amount: firstEstSharedCost,
        approved_amount: firstEstSharedCost,
        lost_funds: null,
      },
      {
        key: "interim",
        is_selected_type:
          this.state.currentActiveTab === "INTERIM" &&
          this.state.selectedInterimStatus === "APPROVED",
        previous_amount: currentInterimApprovedAmount,
        payment_type: "Interim",
        total_estimated_cost: contractedWork.contracted_work_total,
        payment_percent: `${Payment.interimPercent}%`,
        payment_estimated_shared_cost: interimEstSharedCost,
        eoc_document: contractedWork.interim_eoc_document,
        eoc_total_amount: interimActualCost,
        half_eoc_total_amount: interimHalfEocTotal,
        maximum_approved_amount: interimMaxApprovedAmount,
        approved_amount: interimApprovedAmount,
        lost_funds: interimLostFunds,
      },
      {
        key: "final",
        is_selected_type:
          this.state.currentActiveTab === "FINAL" && this.state.selectedFinalStatus === "APPROVED",
        previous_amount: currentFinalApprovedAmount,
        payment_type: "Final",
        payment_percent: `${Payment.finalPercent}%`,
        payment_estimated_shared_cost: finalEstSharedCost,
        eoc_document: contractedWork.final_eoc_document,
        eoc_total_amount: finalActualCost,
        half_eoc_total_amount: finalHalfEocTotal,
        maximum_approved_amount: finalMaxApprovedAmount,
        approved_amount: finalApprovedAmount,
        lost_funds: finalLostFunds,
      },
      {
        key: "total",
        is_selected_type: null,
        previous_amount: null,
        payment_type: null,
        payment_percent: `${Payment.firstPercent + Payment.interimPercent + Payment.finalPercent}%`,
        payment_estimated_shared_cost:
          firstEstSharedCost + interimEstSharedCost + finalEstSharedCost,
        eoc_document: "",
        eoc_total_amount: interimActualCost + finalActualCost,
        half_eoc_total_amount: interimHalfEocTotal + finalHalfEocTotal,
        maximum_approved_amount:
          firstEstSharedCost + interimMaxApprovedAmount + finalMaxApprovedAmount,
        approved_amount: firstEstSharedCost + interimApprovedAmount + finalApprovedAmount,
        lost_funds: interimLostFunds + finalLostFunds,
      },
    ];

    const renderStatusInformationRequiredFields = (paymentType) => (
      <Field
        id={`${lowerCase(paymentType)}_note`}
        name={`${lowerCase(paymentType)}_note`}
        label={
          <>
            <div>Note</div>
            <div className="font-weight-normal">
              Provide a note indicating the reason for setting this work item's&nbsp;
              <Text strong>{lowerCase(paymentType)} payment status</Text> back to Information
              Required. This note will be sent along in an email to the applicant to notify them.
            </div>
          </>
        }
        component={renderConfig.AUTO_SIZE_FIELD}
        validate={[required, maxLength(65536)]}
      />
    );

    const renderStatusReadyForReviewFields = (paymentType) => <br />;

    const renderStatusApprovedFields = (paymentType) => (
      <>
        {paymentType === "INTERIM" &&
          currentInterimApprovedAmount &&
          renderAlreadyApprovedAlert(
            currentInterimApprovedAmount,
            contractedWork.has_interim_prfs,
            "INTERIM"
          )}
        {paymentType === "FINAL" &&
          currentFinalApprovedAmount &&
          renderAlreadyApprovedAlert(
            currentFinalApprovedAmount,
            contractedWork.has_final_prfs,
            "FINAL"
          )}
        <Field
          id={`${lowerCase(paymentType)}_approved_amount`}
          name={`${lowerCase(paymentType)}_approved_amount`}
          label={
            <>
              <div>{capitalize(paymentType)} Financial Contribution</div>
              <div className="font-weight-normal">
                Please enter in the amount to approve for this work item's&nbsp;
                <Text strong>{lowerCase(paymentType)} payment</Text>. This is the amount that will
                be used in generating future&nbsp;
                <Text strong>{lowerCase(paymentType)} payment request forms</Text> containing this
                work item.
              </div>
            </>
          }
          component={renderConfig.FIELD}
          validate={[
            required,
            validateFormApprovedAmount(
              paymentType,
              interimApprovedAmount,
              finalApprovedAmount,
              interimEstSharedCost,
              finalEstSharedCost,
              interimHalfEocTotal,
              finalHalfEocTotal
            ),
          ]}
          inputStyle={{ textAlign: "right" }}
          placeholder="$0.00"
          {...currencyMask}
          onChange={(event, newValue) => {
            if (newValue && newValue.toString().split(".")[0].length > 8) {
              event.preventDefault();
            }
          }}
        />
      </>
    );

    const renderAlreadyApprovedAlert = (previousApprovedAmount, hasPrfs, paymentType) => (
      <>
        <Alert
          showIcon
          message={
            <>
              This work item's {lowerCase(paymentType)} amount has previously been approved at&nbsp;
              <Text strong>{formatMoney(previousApprovedAmount)}</Text>
              {hasPrfs && " and used to generate PRFs"}!
            </>
          }
          type="warning"
          style={{ display: "inline-block" }}
        />
        <br />
        <br />
      </>
    );

    const renderStatusFields = (paymentType, paymentStatus) => {
      switch (paymentStatus) {
        case CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED:
          return renderStatusInformationRequiredFields(paymentType);
        case CONTRACTED_WORK_PAYMENT_STATUS.READY_FOR_REVIEW:
          return renderStatusReadyForReviewFields(paymentType);
        case CONTRACTED_WORK_PAYMENT_STATUS.APPROVED:
          return renderStatusApprovedFields(paymentType);
        default:
          throw new Error("Unknown contracted work payment status code received!");
      }
    };

    const handleSubmit = this.props.handleSubmit((values) =>
      this.props.onSubmit(this.state.currentActiveTab, {
        contracted_work_payment_code: this.state.currentActiveTab,
        ...values,
      })
    );

    return (
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Row gutter={48}>
          <Col span={24}>
            <Descriptions title="Contracted Work Information" column={1}>
              <Descriptions.Item label="Application Reference Number">
                {contractedWork.application_guid}
              </Descriptions.Item>
              <Descriptions.Item label="Company Name">
                {contractedWork.company_name}
              </Descriptions.Item>
              <Descriptions.Item label="Well Authorization Number">
                {contractedWork.well_authorization_number}
              </Descriptions.Item>
              <Descriptions.Item label="Work ID">{contractedWork.work_id}</Descriptions.Item>
              <Descriptions.Item label="Work Type">
                {this.props.contractedWorkTypeOptionsHash[contractedWork.contracted_work_type]}
              </Descriptions.Item>
              <Descriptions.Item label="Planned End Date">
                {formatDate(contractedWork.planned_end_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Estimated Cost">
                {formatMoney(contractedWork.contracted_work_total)}
              </Descriptions.Item>
              <Descriptions.Item label="Selected for Audit">
                {(contractedWorkPayment.audit_ind && "Yes") || "No"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={24}>
            <Title level={4}>Financial Contribution Table</Title>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              className="total-row-table table-headers-center table-rows-center"
            />
          </Col>
          <Col span={24}>
            <Title level={4}>Submission Review</Title>
            <Tabs type="card" className="ant-tabs-center" onChange={this.handleTabChange}>
              <TabPane tab="Interim" key="INTERIM" disabled={this.props.submitting}>
                <Descriptions title="Interim Submission Information" column={3}>
                  <Descriptions.Item label="Total Hours Worked">
                    {contractedWorkPayment.interim_total_hours_worked_to_date || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Number of Workers">
                    {contractedWorkPayment.interim_number_of_workers || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitter Name">
                    {contractedWorkPayment.interim_submitter_name || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Interim Report" span={3}>
                    {contractedWorkPaymentExists
                      ? contractedWorkPayment.interim_report
                        ? contractedWorkPayment.interim_report
                        : `Due in ${contractedWork.interim_report_days_until_deadline} days`
                      : Strings.DASH}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Current Interim Status" column={2}>
                  <Descriptions.Item label="Status">
                    {
                      this.props.contractedWorkPaymentStatusOptionsHash[
                        contractedWorkPayment.interim_payment_status_code
                      ]
                    }
                  </Descriptions.Item>
                  {contractedWorkPayment.interim_payment_status_code ===
                    CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED && (
                    <Descriptions.Item label="Admin Note">
                      {contractedWorkPayment.interim_payment_status.note}
                    </Descriptions.Item>
                  )}
                  {contractedWorkPayment.interim_payment_status_code ===
                    CONTRACTED_WORK_PAYMENT_STATUS.APPROVED && (
                    <Descriptions.Item label="Financial Contribution">
                      {formatMoney(contractedWorkPayment.interim_paid_amount)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                <Title level={4}>Update Interim Status</Title>
                {renderStatusSelectField("INTERIM")}
                {renderStatusFields("INTERIM", this.state.selectedInterimStatus)}
              </TabPane>
              <TabPane
                tab="Final"
                key="FINAL"
                disabled={
                  this.props.submitting || isEmpty(contractedWorkPayment.final_payment_status)
                }
              >
                <Descriptions title="Final Submission Information" column={3}>
                  <Descriptions.Item label="Total Hours Worked">
                    {contractedWorkPayment.final_total_hours_worked_to_date || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Number of Workers">
                    {contractedWorkPayment.final_number_of_workers || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitter Name">
                    {contractedWorkPayment.final_submitter_name || Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Final Report" span={3}>
                    {(contractedWorkPaymentExists &&
                      ((!isEmpty(contractedWorkPayment.final_report_document) && (
                        <LinkButton
                          onClick={() =>
                            downloadDocument(
                              contractedWork.application_guid,
                              contractedWorkPayment.final_report_document.application_document_guid,
                              contractedWorkPayment.final_report_document.document_name
                            )
                          }
                        >
                          Download
                        </LinkButton>
                      )) ||
                        "Not yet submitted")) ||
                      Strings.DASH}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Current Final Status" column={2}>
                  <Descriptions.Item label="Status">
                    {
                      this.props.contractedWorkPaymentStatusOptionsHash[
                        contractedWorkPayment.final_payment_status_code
                      ]
                    }
                  </Descriptions.Item>
                  {contractedWorkPayment.final_payment_status_code ===
                    CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED && (
                    <Descriptions.Item label="Admin Note">
                      {contractedWorkPayment.final_payment_status.note || Strings.DASH}
                    </Descriptions.Item>
                  )}
                  {contractedWorkPayment.final_payment_status_code ===
                    CONTRACTED_WORK_PAYMENT_STATUS.APPROVED && (
                    <Descriptions.Item label="Financial Contribution">
                      {formatMoney(contractedWorkPayment.final_paid_amount)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                <Title level={4}>Update Final Status</Title>
                {(contractedWorkPaymentExists &&
                  isEmpty(contractedWorkPayment.final_payment_status) && (
                    <>
                      <Alert
                        showIcon
                        message="Cannot update the final payment status until it has been submitted by the applicant."
                        type="warning"
                        style={{ display: "inline-block" }}
                      />
                      <br />
                      <br />
                    </>
                  )) || [
                  renderStatusSelectField("FINAL"),
                  renderStatusFields("FINAL", this.state.selectedFinalStatus),
                ]}
              </TabPane>
              <TabPane
                tab="Final Report"
                key="FINAL_REPORT"
                disabled={
                  this.props.submitting || isEmpty(contractedWorkPayment.final_payment_status)
                }
              >
                <Descriptions
                  title="Final Report - Reporting Information"
                  column={1}
                  layout="vertical"
                  colon={false}
                >
                  <Descriptions.Item label="Surface Landowner">
                    {(contractedWorkPaymentExists && contractedWorkPayment.surface_landowner) ||
                      Strings.DASH}
                  </Descriptions.Item>
                  <Descriptions.Item label="Level of Reclamation achieved for the Dormant Site">
                    {((!contractedWorkPaymentExists ||
                      contractedWorkPayment.reclamation_was_achieved === null) &&
                      Strings.DASH) ||
                      (contractedWorkPayment.reclamation_was_achieved === true &&
                        `${workTypeName} Complete`) ||
                      `${workTypeName} Not Complete`}
                  </Descriptions.Item>

                  {workType === "abandonment" && (
                    <>
                      <Descriptions.Item label="Well Abandonment was completed to Cut and Capped">
                        {formatBooleanField(
                          contractedWorkPayment.abandonment_cut_and_capped_completed
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Notice of Operations (NOO) form was submitted through OGC eSubmission portal">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.abandonment_notice_of_operations_submitted
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="Was pipeline abandoned as part of the Dormant Site Abandonment process?">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.abandonment_was_pipeline_abandoned
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="Approximate length of pipeline abandoned as part of this work (if applicable)">
                        {(contractedWorkPaymentExists &&
                          contractedWorkPayment.abandonment_metres_of_pipeline_abandoned &&
                          `${contractedWorkPayment.abandonment_metres_of_pipeline_abandoned} metres`) ||
                          Strings.DASH}
                      </Descriptions.Item>
                    </>
                  )}

                  {workType === "remediation" && (
                    <>
                      <Descriptions.Item label="All identified contamination relating to the Dormant Site was remediated to meet Contaminated Sites Regulations standards or risk-based standards relevant to the site">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.remediation_identified_contamination_meets_standards
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?">
                        {(contractedWorkPaymentExists &&
                          formatDocSubmitted(
                            contractedWorkPayment.remediation_type_of_document_submitted
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 1) requirements?">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.remediation_reclaimed_to_meet_cor_p1_requirements
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                    </>
                  )}

                  {workType === "reclamation" && (
                    <>
                      <Descriptions.Item label="Dormant Site reclamation meets Certificate of Restoration (Part 2) requirements">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.reclamation_reclaimed_to_meet_cor_p2_requirements
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="Surface reclamation has been completed to match surrounding natural contour and re-vegetated with ecologically suitable species">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.reclamation_surface_reclamation_criteria_met
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                    </>
                  )}

                  {(workType === "preliminary_site_investigation" ||
                    workType === "detailed_site_investigation") && (
                    <>
                      <Descriptions.Item label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?">
                        {(contractedWorkPaymentExists &&
                          formatDocSubmitted(
                            contractedWorkPayment.site_investigation_type_of_document_submitted
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                      <Descriptions.Item label="During site investigation, concerns were identified that are specific to other interested parties (e.g., landowners, municipalities, regional districts or Indigenous nations)">
                        {(contractedWorkPaymentExists &&
                          formatBooleanField(
                            contractedWorkPayment.site_investigation_concerns_identified
                          )) ||
                          Strings.DASH}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </TabPane>
              <TabPane tab="Administrative" key="ADMIN" disabled={this.props.submitting}>
                <Title level={4}>Submission Review - Administrative Information</Title>
                <Field
                  id="audit_ind"
                  name="audit_ind"
                  label="This work item has been selected for audit"
                  component={renderConfig.CHECKBOX}
                />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
        <div className="right">
          {((this.state.currentActiveTab === "FINAL_REPORT" ||
            (this.state.currentActiveTab === "FINAL" &&
              isEmpty(contractedWorkPayment.final_payment_status))) && (
            <Button type="primary" onClick={this.props.closeModal} disabled={this.props.submitting}>
              Close
            </Button>
          )) || (
            <>
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
                disabled={
                  this.state.currentActiveTab === "ADMIN" &&
                  this.props.formValues.audit_ind === contractedWorkPayment.audit_ind
                }
              >
                {(this.state.currentActiveTab !== "ADMIN" && (
                  <>
                    Update {capitalize(this.state.currentActiveTab)} Status to&nbsp;
                    {
                      this.props.contractedWorkPaymentStatusOptionsHash[
                        this.state.currentActiveTab === "INTERIM"
                          ? this.state.selectedInterimStatus
                          : this.state.selectedFinalStatus
                      ]
                    }
                  </>
                )) ||
                  "Update Administrative Information"}
              </Button>
            </>
          )}
        </div>
      </Form>
    );
  }
}

AdminChangeContractedWorkPaymentStatusForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT_FORM)(state),
  contractedWorkTypeOptionsHash: getContractedWorkTypeOptionsHash(state),
  contractedWorkPaymentStatusOptionsHash: getContractedWorkPaymentStatusOptionsHash(state),
  dropdownContractedWorkPaymentStatusOptions: getDropdownContractedWorkPaymentStatusOptions(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT_FORM,
    enableReinitialize: true,
  })
)(AdminChangeContractedWorkPaymentStatusForm);
