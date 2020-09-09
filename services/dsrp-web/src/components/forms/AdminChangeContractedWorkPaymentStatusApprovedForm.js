import React, { Component } from "react";
import { Field, getFormValues } from "redux-form";
import { Typography, Table, Alert, Descriptions } from "antd";
import { connect } from "react-redux";
import { startCase, camelCase, lowerCase, isEmpty, isEqual, capitalize } from "lodash";
import { formatMoney, currencyMask, formatDate } from "@/utils/helpers";
import { required } from "@/utils/validate";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { getContractedWorkTypeOptionsHash } from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";

const { Text, Title } = Typography;

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkTypeOptionsHash: PropTypes.any.isRequired,
  contractedWorkPaymentType: PropTypes.string,
  isAdminView: PropTypes.bool,
};

const defaultProps = {
  contractedWorkPaymentType: "interim",
  isAdminView: false,
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

export class AdminChangeContractedWorkPaymentStatusApprovedForm extends Component {
  shouldComponentUpdate = (nextProps) => !isEqual(nextProps.formValues, this.props.formValues);

  render() {
    const contractedWorkTypeDescription = startCase(
      camelCase(this.props.contractedWorkPaymentType)
    );
    const contractedWorkTypeFormId = lowerCase(this.props.contractedWorkPaymentType);

    const workType = this.props.contractedWork.contracted_work_type;
    const workTypeName =
      workType === "preliminary_site_investigation" || workType === "detailed_site_investigation"
        ? "Site Investigation"
        : capitalize(workType);

    const columns = [
      {
        title: "Payment Type",
        dataIndex: "payment_type",
        render: (text) => <div>{<Text strong>{text}</Text>}</div>,
      },
      {
        title: "Payment Percent",
        dataIndex: "payment_percent",
        render: (text) => <div>{text}</div>,
      },
      {
        title: "Est. Shared Cost",
        dataIndex: "payment_estimated_shared_cost",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text)}</div>,
      },
      {
        title: "EoC Download",
        dataIndex: "eoc_document",
        render: (text) => (
          <div>
            {(!isEmpty(text) && (
              <LinkButton
                onClick={() =>
                  downloadDocument(
                    this.props.contractedWork.application_guid,
                    text.application_document_guid,
                    text.document_name
                  )
                }
              >
                Download
              </LinkButton>
            )) ||
              (text === null && Strings.NA)}
          </div>
        ),
      },
      {
        title: "EoC Total Amount",
        dataIndex: "eoc_total_amount",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text) || Strings.NA}</div>,
      },
      {
        title: "50% of EoC Total Amount",
        dataIndex: "half_eoc_total_amount",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text) || Strings.NA}</div>,
      },
      {
        title: "Approved Amount",
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
        title: "Unused Funds",
        dataIndex: "lost_funds",
        className: "table-column-right-align",
        render: (text) => <div>{formatMoney(text || 0)}</div>,
      },
    ];

    const formApprovedAmount =
      this.props.formValues && this.props.formValues.approved_amount
        ? parseFloat(this.props.formValues.approved_amount)
        : null;

    const contractedWork = this.props.contractedWork;
    const contractedWorkPayment = contractedWork.contracted_work_payment || {};

    const firstPercent = 10;
    const interimPercent = 60;
    const finalPercent = 30;

    const getTypeEstSharedCost = (percent, estSharedCost) => estSharedCost * (percent / 100);
    const getTypeMaxEligibleAmount = (eocTotalAmount) => eocTotalAmount * 0.5;

    // Initial payment calculations
    const firstEstSharedCost = parseFloat(
      getTypeEstSharedCost(firstPercent, contractedWork.estimated_shared_cost)
    );

    // Interim payment calculations
    const interimEstSharedCost = parseFloat(
      getTypeEstSharedCost(interimPercent, contractedWork.estimated_shared_cost)
    );
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
      this.props.contractedWorkPaymentType === "INTERIM"
        ? formApprovedAmount
          ? formApprovedAmount
          : null
        : currentInterimApprovedAmount
        ? currentInterimApprovedAmount
        : null;
    const interimLostFunds = interimEstSharedCost - interimApprovedAmount;

    // Final payment calculations
    const finalEstSharedCost = parseFloat(
      getTypeEstSharedCost(finalPercent, contractedWork.estimated_shared_cost)
    );
    const currentFinalApprovedAmount = contractedWorkPayment.final_paid_amount
      ? parseFloat(contractedWorkPayment.final_paid_amount)
      : null;
    const finalActualCost = contractedWorkPayment.final_actual_cost
      ? parseFloat(contractedWorkPayment.final_actual_cost)
      : null;
    const finalHalfEocTotal = finalActualCost ? getTypeMaxEligibleAmount(finalActualCost) : null;
    const finalApprovedAmount =
      this.props.contractedWorkPaymentType === "FINAL"
        ? formApprovedAmount
          ? formApprovedAmount
          : null
        : currentFinalApprovedAmount
        ? currentFinalApprovedAmount
        : null;
    const finalLostFunds = finalEstSharedCost - finalApprovedAmount;

    const dataSource = [
      {
        key: "initial",
        is_selected_type: null,
        previous_amount: null,
        payment_type: "Initial",
        payment_percent: `${firstPercent}%`,
        estimated_shared_cost: contractedWork.estimated_shared_cost,
        payment_estimated_shared_cost: firstEstSharedCost,
        eoc_document: null,
        eoc_total_amount: null,
        half_eoc_total_amount: null,
        approved_amount: firstEstSharedCost,
        lost_funds: null,
      },
      {
        key: "interim",
        is_selected_type: this.props.contractedWorkPaymentType === "INTERIM",
        previous_amount: currentInterimApprovedAmount,
        payment_type: "Interim",
        total_estimated_cost: contractedWork.contracted_work_total,
        payment_percent: `${interimPercent}%`,
        payment_estimated_shared_cost: interimEstSharedCost,
        eoc_document: contractedWork.interim_eoc_document,
        eoc_total_amount: interimActualCost,
        half_eoc_total_amount: interimHalfEocTotal,
        approved_amount: interimApprovedAmount,
        lost_funds: interimLostFunds,
      },
      {
        key: "final",
        is_selected_type: this.props.contractedWorkPaymentType === "FINAL",
        previous_amount: currentFinalApprovedAmount,
        payment_type: "Final",
        payment_percent: `${finalPercent}%`,
        payment_estimated_shared_cost: finalEstSharedCost,
        eoc_document: contractedWork.final_eoc_document,
        eoc_total_amount: finalActualCost,
        half_eoc_total_amount: finalHalfEocTotal,
        approved_amount: finalApprovedAmount,
        lost_funds: finalLostFunds,
      },
      {
        key: "total",
        is_selected_type: null,
        previous_amount: null,
        payment_type: null,
        payment_percent: `${firstPercent + interimPercent + finalPercent}%`,
        payment_estimated_shared_cost:
          firstEstSharedCost + interimEstSharedCost + finalEstSharedCost,
        eoc_document: "",
        eoc_total_amount: interimActualCost + finalActualCost,
        half_eoc_total_amount: interimHalfEocTotal + finalHalfEocTotal,
        approved_amount: firstEstSharedCost + interimApprovedAmount + finalApprovedAmount,
        lost_funds: interimLostFunds + finalLostFunds,
      },
    ];

    const renderAlreadyApprovedAlert = (previousApprovedAmount, hasPrfs) => (
      <>
        <Alert
          showIcon
          message={
            <>
              This work item's {contractedWorkTypeFormId} amount has previously been approved
              at&nbsp;
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

    const contractedWorkPaymentExists = !isEmpty(contractedWorkPayment);

    return (
      <>
        <Descriptions title="Contracted Work Information" column={1}>
          <Descriptions.Item label="Application Reference Number">
            {contractedWork.application_guid}
          </Descriptions.Item>
          <Descriptions.Item label="Company Name">{contractedWork.company_name}</Descriptions.Item>
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
        </Descriptions>

        <br />
        <Descriptions title="Interim Payment Information" column={1}>
          <Descriptions.Item label="Total Hours Worked">
            {contractedWorkPayment.interim_total_hours_worked_to_date || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Total Number of Workers">
            {contractedWorkPayment.interim_number_of_workers || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Submitter Name">
            {contractedWorkPayment.interim_submitter_name || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Interim Report">
            {contractedWorkPaymentExists
              ? contractedWorkPayment.interim_report
                ? contractedWorkPayment.interim_report
                : `Due in ${contractedWork.interim_report_days_until_deadline} days`
              : Strings.DASH}
          </Descriptions.Item>
        </Descriptions>

        <br />
        <Descriptions title="Final Payment Information" column={1}>
          <Descriptions.Item label="Total Hours Worked">
            {contractedWorkPayment.final_total_hours_worked_to_date || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Total Number of Workers">
            {contractedWorkPayment.final_number_of_workers || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Submitter Name">
            {contractedWorkPayment.final_submitter_name || Strings.DASH}
          </Descriptions.Item>
          <Descriptions.Item label="Final Report">
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

        <br />
        <Descriptions
          title="Final Report - Reporting Information"
          column={1}
          layout="vertical"
          colon={false}
        >
          <Descriptions.Item label="Surface Landowner">
            {contractedWorkPaymentExists ? contractedWorkPayment.surface_landowner : Strings.DASH}
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
              <Descriptions.Item label="Was Well Abandonment completed to Cut and Capped?">
                {formatBooleanField(contractedWorkPayment.abandonment_cut_and_capped_completed)}
              </Descriptions.Item>
              <Descriptions.Item label="Was a Notice of Operations (NOO) form submission completed using the OGC eSubmission portal?">
                {(contractedWorkPaymentExists &&
                  formatBooleanField(
                    contractedWorkPayment.abandonment_notice_of_operations_submitted
                  )) ||
                  Strings.DASH}
              </Descriptions.Item>
              <Descriptions.Item label="Was pipeline abandoned as part of the Dormant Site Abandonment process?">
                {(contractedWorkPaymentExists &&
                  formatBooleanField(contractedWorkPayment.abandonment_was_pipeline_abandoned)) ||
                  Strings.DASH}
              </Descriptions.Item>
              <Descriptions.Item label="If pipeline was abandoned as part of the Dormant Site Abandonment process, provide the length (approximate) of pipeline abandoned (metres).">
                {(contractedWorkPaymentExists &&
                  contractedWorkPayment.abandonment_metres_of_pipeline_abandoned &&
                  `${contractedWorkPayment.abandonment_metres_of_pipeline_abandoned} metres`) ||
                  Strings.DASH}
              </Descriptions.Item>
            </>
          )}

          {workType === "remediation" && (
            <>
              <Descriptions.Item label="Was all identified contamination relating to the Dormant Site remediated to meet Contaminated Sites Regulations remediation standards or risk-based standards relevant to the Site?">
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
              <Descriptions.Item label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 2) requirements?">
                {(contractedWorkPaymentExists &&
                  formatBooleanField(
                    contractedWorkPayment.reclamation_reclaimed_to_meet_cor_p2_requirements
                  )) ||
                  Strings.DASH}
              </Descriptions.Item>
              <Descriptions.Item label="Has the surface reclamation been completed to match surrounding natural contour and revegetated with ecologically suitable species?">
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
              <Descriptions.Item label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 2) requirements?">
                {(contractedWorkPaymentExists &&
                  formatDocSubmitted(
                    contractedWorkPayment.site_investigation_type_of_document_submitted
                  )) ||
                  Strings.DASH}
              </Descriptions.Item>
              <Descriptions.Item label="Were any concerns identified through site investigation that are specific to other interested parties (e.g. landowners, municipalities, regional districts or local Indigenous nations)?">
                {(contractedWorkPaymentExists &&
                  formatBooleanField(
                    contractedWorkPayment.site_investigation_concerns_identified
                  )) ||
                  Strings.DASH}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>

        <br />
        <Title level={4}>Contracted Work Payment Information Breakdown</Title>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="total-row-table table-headers-center table-rows-center"
        />

        {this.props.contractedWorkPaymentType === "INTERIM" &&
          currentInterimApprovedAmount &&
          renderAlreadyApprovedAlert(currentInterimApprovedAmount, contractedWork.has_interim_prfs)}
        {this.props.contractedWorkPaymentType === "FINAL" &&
          currentFinalApprovedAmount &&
          renderAlreadyApprovedAlert(currentFinalApprovedAmount, contractedWork.has_final_prfs)}

        {!this.props.isAdminView && (
          <>
            <br />
            <Field
              id="approved_amount"
              name="approved_amount"
              label={
                <>
                  <div>Approved {contractedWorkTypeDescription} Amount</div>
                  <div className="font-weight-normal">
                    Please enter in the amount to approve for this work item's&nbsp;
                    <Text strong>{contractedWorkTypeFormId} payment</Text>. This is the amount that
                    will be used in generating future&nbsp;
                    <Text strong>{contractedWorkTypeFormId} payment request forms</Text> containing
                    this work item.
                  </div>
                </>
              }
              component={renderConfig.FIELD}
              validate={[
                required,
                validateFormApprovedAmount(
                  this.props.contractedWorkPaymentType,
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
        )}
      </>
    );
  }
}

AdminChangeContractedWorkPaymentStatusApprovedForm.propTypes = propTypes;
AdminChangeContractedWorkPaymentStatusApprovedForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS_FORM)(state),
  contractedWorkTypeOptionsHash: getContractedWorkTypeOptionsHash(state),
});

export default connect(mapStateToProps)(AdminChangeContractedWorkPaymentStatusApprovedForm);
