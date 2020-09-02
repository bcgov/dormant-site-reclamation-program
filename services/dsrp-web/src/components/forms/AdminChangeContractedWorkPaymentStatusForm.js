import React, { Component } from "react";
import { reduxForm, Field, getFormValues } from "redux-form";
import {
  Row,
  Col,
  Form,
  Button,
  Typography,
  Popconfirm,
  Table,
  Tooltip,
  Icon,
  Alert,
  Descriptions,
} from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { startCase, camelCase, lowerCase, isEmpty, isEqual } from "lodash";
import { formatMoney, currencyMask, formatDate } from "@/utils/helpers";
import { required, maxLength } from "@/utils/validate";
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
  contractedWorkPaymentStatus: PropTypes.string.isRequired,
  contractedWorkPaymentType: PropTypes.string.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  contractedWorkTypeOptionsHash: PropTypes.any.isRequired,
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

export class AdminChangeContractedWorkPaymentStatusForm extends Component {
  shouldComponentUpdate = (nextProps) => !isEqual(nextProps.formValues, this.props.formValues);

  render() {
    const contractedWorkTypeDescription = startCase(
      camelCase(this.props.contractedWorkPaymentType)
    );
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
    const contractedWorkPayment = contractedWork.contracted_work_payment;

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

    const renderFormStatusApproved = () => (
      <>
        <Descriptions title="Contracted Work Information" column={1}>
          <Descriptions.Item label="Application Reference Number">
            {contractedWork.application_guid}
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
        </Descriptions>
        <br />
        <Descriptions title="Contracted Work Payment Information" column={1}>
          <Descriptions.Item label="Interim Report">
            {contractedWorkPayment.interim_report
              ? contractedWorkPayment.interim_report
              : `Due in ${contractedWork.interim_report_days_until_deadline} days`}
          </Descriptions.Item>
          <Descriptions.Item label="Final Report">
            {(!isEmpty(contractedWorkPayment.final_report_document) && (
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
              "Not yet submitted"}
          </Descriptions.Item>
          <Descriptions.Item label="Total Estimated Cost">
            {formatMoney(contractedWork.contracted_work_total)}
          </Descriptions.Item>
        </Descriptions>

        <br />
        <Title level={4}>Contracted Work Payment Information Breakdown</Title>
        <Table
          id="approve-contracted-work-payment-table"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="table-headers-center table-rows-center"
        />

        {this.props.contractedWorkPaymentType === "INTERIM" &&
          currentInterimApprovedAmount &&
          renderAlreadyApprovedAlert(currentInterimApprovedAmount, contractedWork.has_interim_prfs)}
        {this.props.contractedWorkPaymentType === "FINAL" &&
          currentFinalApprovedAmount &&
          renderAlreadyApprovedAlert(currentFinalApprovedAmount, contractedWork.has_final_prfs)}

        <br />
        <Field
          id="approved_amount"
          name="approved_amount"
          label={
            <>
              <div>Approved {contractedWorkTypeDescription} Amount</div>
              <div className="font-weight-normal">
                Please enter in the amount to approve for this work item's&nbsp;
                <Text strong>{contractedWorkTypeFormId} payment</Text>. This is the amount that will
                be used in generating future&nbsp;
                <Text strong>{contractedWorkTypeFormId} payment request forms</Text> containing this
                work item.
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
