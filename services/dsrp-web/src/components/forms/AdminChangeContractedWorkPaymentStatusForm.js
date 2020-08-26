import React from "react";
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
import { startCase, camelCase, lowerCase } from "lodash";
import { formatMoney, currencyMask, formatDate } from "@/utils/helpers";
import { required } from "@/utils/validate";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";

const { Text, Title, Paragraph } = Typography;

const propTypes = {
  contractedWork: PropTypes.any.isRequired,
  contractedWorkPaymentStatus: PropTypes.string.isRequired,
  contractedWorkPaymentType: PropTypes.string.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const toolTip = (title, extraClassName) => (
  <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Tooltip>
);

export const AdminChangeContractedWorkPaymentStatusForm = (props) => {
  const contractedWorkTypeDescription = startCase(camelCase(props.contractedWorkPaymentType));
  const contractedWorkTypeFormId = lowerCase(props.contractedWorkPaymentType);

  const renderFormStatusInformationRequired = () => (
    <>
      <Field id="note" name="note" label="Note" component={renderConfig.AUTO_SIZE_FIELD} />
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
      render: (text) => <div>{formatMoney(text)}</div>,
    },
    {
      title: "EoC Download",
      dataIndex: "eoc_document_guid",
      render: (text) => (
        <div>
          {(text && (
            <LinkButton
              onClick={() =>
                downloadDocument(
                  props.contractedWork.application_guid,
                  text,
                  // TODO: Use stored title of actual document.
                  "Dormant Sites Reclamation Program - Evidence of Cost.xlsx"
                )
              }
            >
              Download
            </LinkButton>
          )) ||
            Strings.NA}
        </div>
      ),
    },
    {
      title: "EoC Total Amount",
      dataIndex: "eoc_total_amount",
      render: (text) => <div>{formatMoney(text) || Strings.NA}</div>,
    },
    {
      title: "50% of EoC Total Amount",
      dataIndex: "half_eoc_total_amount",
      render: (text) => <div>{formatMoney(text) || Strings.NA}</div>,
    },
    {
      title: "Approved Amount",
      dataIndex: "approved_amount",
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
      title: "Lost Eligible Funding",
      dataIndex: "lost_funds",
      render: (text) => <div>{formatMoney(text || 0)}</div>,
    },
  ];

  const formApprovedAmount =
    props.formValues && props.formValues.approved_amount
      ? parseFloat(props.formValues.approved_amount)
      : null;

  const firstPercent = 10;
  const interimPercent = 60;
  const finalPercent = 30;

  const getTypeEstSharedCost = (percent, estSharedCost) => estSharedCost * (percent / 100);
  const getTypeMaxEligibleAmount = (eocTotalAmount) => eocTotalAmount * 0.5;

  const contractedWork = props.contractedWork;
  const contractedWorkPayment = contractedWork.contracted_work_payment;

  const firstEstSharedCost = parseFloat(
    getTypeEstSharedCost(firstPercent, contractedWork.estimated_shared_cost)
  );

  // Interim calculations
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
    props.contractedWorkPaymentType === "INTERIM"
      ? formApprovedAmount
        ? formApprovedAmount
        : null
      : currentInterimApprovedAmount
      ? currentInterimApprovedAmount
      : null;

  // Final calculations
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
    props.contractedWorkPaymentType === "FINAL"
      ? formApprovedAmount
        ? formApprovedAmount
        : null
      : currentFinalApprovedAmount
      ? currentFinalApprovedAmount
      : null;

  const interimLostFunds = interimEstSharedCost - interimApprovedAmount;
  const finalLostFunds = finalEstSharedCost - finalApprovedAmount;

  const dataSource = [
    {
      is_selected_type: null,
      previous_amount: null,
      payment_type: "Initial",
      payment_percent: `${firstPercent}%`,
      estimated_shared_cost: contractedWork.estimated_shared_cost,
      payment_estimated_shared_cost: firstEstSharedCost,
      eoc_document_guid: null,
      eoc_total_amount: null,
      half_eoc_total_amount: null,
      approved_amount: firstEstSharedCost,
      lost_funds: null,
    },
    {
      is_selected_type: props.contractedWorkPaymentType === "INTERIM",
      previous_amount: currentInterimApprovedAmount,
      payment_type: "Interim",
      total_estimated_cost: contractedWork.contracted_work_total,
      payment_percent: `${interimPercent}%`,
      payment_estimated_shared_cost: interimEstSharedCost,
      eoc_document_guid: contractedWork.interim_eoc,
      eoc_total_amount: interimActualCost,
      half_eoc_total_amount: interimHalfEocTotal,
      approved_amount: interimApprovedAmount,
      lost_funds: interimLostFunds,
    },
    {
      is_selected_type: props.contractedWorkPaymentType === "FINAL",
      previous_amount: currentFinalApprovedAmount,
      payment_type: "Final",
      payment_percent: `${finalPercent}%`,
      payment_estimated_shared_cost: finalEstSharedCost,
      eoc_document_guid: contractedWork.final_eoc,
      eoc_total_amount: finalActualCost,
      half_eoc_total_amount: finalHalfEocTotal,
      approved_amount: finalApprovedAmount,
      lost_funds: finalLostFunds,
    },
    {
      is_selected_type: null,
      previous_amount: null,
      payment_type: "Total",
      payment_percent: `${firstPercent + interimPercent + finalPercent}%`,
      payment_estimated_shared_cost: firstEstSharedCost + interimEstSharedCost + finalEstSharedCost,
      eoc_document_guid: null,
      eoc_total_amount: interimActualCost + finalActualCost,
      half_eoc_total_amount: interimHalfEocTotal + finalHalfEocTotal,
      approved_amount: firstEstSharedCost + interimApprovedAmount + finalApprovedAmount,
      lost_funds: interimLostFunds + finalLostFunds,
    },
  ];

  console.log("dataSource:\n", dataSource);

  const renderAlreadyApprovedAlert = (previousApprovedAmount, hasPrfs) => (
    <>
      <Alert
        showIcon
        message={
          <>
            This work item's {contractedWorkTypeFormId} amount has previously been approved at&nbsp;
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
      <Descriptions title="Contracted Work Payment Information" column={1}>
        <Descriptions.Item label="Interim Report">
          {contractedWorkPayment.interim_report
            ? contractedWorkPayment.interim_report
            : `Submission due in ${contractedWork.interim_report_days_until_deadline} days`}
        </Descriptions.Item>
        <Descriptions.Item label="Final Report">
          {(contractedWorkPayment.final_report_application_document_guid && (
            <LinkButton
              onClick={() =>
                downloadDocument(
                  contractedWork.application_guid,
                  contractedWorkPayment.final_report_application_document_guid,
                  // TODO: Use stored title of actual document.
                  "Dormant Sites Reclamation Program - Final Report.pdf"
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
        <Descriptions.Item label="Estimated Shared Cost">
          {formatMoney(contractedWork.estimated_shared_cost)}
        </Descriptions.Item>
      </Descriptions>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className="table-headers-center table-rows-center"
      />

      {props.contractedWorkPaymentType === "INTERIM" &&
        currentInterimApprovedAmount &&
        renderAlreadyApprovedAlert(currentInterimApprovedAmount, contractedWork.has_interim_prfs)}
      {props.contractedWorkPaymentType === "FINAL" &&
        currentFinalApprovedAmount &&
        renderAlreadyApprovedAlert(currentFinalApprovedAmount, contractedWork.has_final_prfs)}

      <Field
        id="approved_amount"
        name="approved_amount"
        label={
          <>
            <Text className="color-primary" strong>
              Approved {contractedWorkTypeDescription} Amount
            </Text>
            <br />
            <Text>
              Please enter in the amount to approve for this work item's&nbsp;
              <Text strong>{contractedWorkTypeFormId} payment</Text>. This is the amount that
              &nbsp;will be used in generating future&nbsp;
              {contractedWorkTypeFormId} payment request forms containing this work item.
            </Text>
          </>
        }
        component={renderConfig.FIELD}
        validate={[required]}
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

  console.log(props);

  let renderStatusForm = null;
  switch (props.contractedWorkPaymentStatus) {
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
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={48}>
        <Col span={24}>
          <Descriptions title="Contracted Work Information" column={1}>
            <Descriptions.Item label="Application Reference Number">
              {contractedWork.application_guid}
            </Descriptions.Item>
            <Descriptions.Item label="Well Authorization Number">
              {contractedWork.well_authorization_number}
            </Descriptions.Item>
            <Descriptions.Item label="Work ID">{contractedWork.work_id}</Descriptions.Item>
            <Descriptions.Item label="Planned End Date">
              {formatDate(contractedWork.planned_end_date)}
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={24}>{renderStatusForm()}</Col>
      </Row>
      <div className="right">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want cancel?"
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
          Update Status to&nbsp;
          {props.contractedWorkPaymentStatusOptionsHash[props.contractedWorkPaymentStatus]}
        </Button>
      </div>
    </Form>
  );
};

AdminChangeContractedWorkPaymentStatusForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS_FORM)(state),
});

const mapDispatchToProps = () => ({});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS_FORM,
  })
)(AdminChangeContractedWorkPaymentStatusForm);
