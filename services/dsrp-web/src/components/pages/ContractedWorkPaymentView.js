import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import { startCase, camelCase, round, isEmpty } from "lodash";
import { Row, Col, Typography, Table, Icon, Button, Popover, Tooltip } from "antd";
import {
  formatDate,
  formatMoney,
  nullableStringOrNumberSorter,
  dateSorter,
  contractedWorkIdSorter,
} from "@/utils/helpers";
import {
  fetchApplicationApprovedContractedWorkById,
  updateContractedWorkPaymentInterim,
  updateContractedWorkPaymentFinal,
  updateContractedWorkPaymentInterimReport,
} from "@/actionCreators/applicationActionCreator";
import { getApplicationApprovedContractedWork } from "@/selectors/applicationSelectors";
import { getContractedWorkPaymentStatusOptionsHash } from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import { CONTRACTED_WORK_PAYMENT_STATUS, PAYMENT_TYPES } from "@/constants/payments";
import CustomPropTypes from "@/customPropTypes";
import { EOC_TEMPLATE, FINAL_REPORT_TEMPLATE } from "@/constants/assets";
import * as Payment from "@/utils/paymentHelper";

const propTypes = {
  applicationGuid: PropTypes.string.isRequired,
  applicationSummary: CustomPropTypes.applicationSummary.isRequired,
  applicationApprovedContractedWork: PropTypes.arrayOf(PropTypes.any).isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.objectOf(PropTypes.any),
  fetchApplicationApprovedContractedWorkById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  applicationApprovedContractedWork: [],
};

const { Paragraph, Title, Text } = Typography;

const popover = (message, extraClassName) => (
  <Popover
    title={<div className="font-size-small">Admin Note</div>}
    content={<div className="font-size-small">{message}</div>}
  >
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Popover>
);

const fieldWithTooltip = (text, title, tooltipTitle, icon, isDisplayTooltip = false) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: `${isDisplayTooltip ? "absolute" : ""}` }} title={title}>
      {text}
    </div>
    {isDisplayTooltip && (
      <div style={{ position: "relative", left: "-18px" }}>
        <Tooltip title={tooltipTitle} placement="right" mouseEnterDelay={0.3}>
          <Icon type="info-circle" className={`icon-sm ${icon}`} style={{ marginLeft: 4 }} />
        </Tooltip>
      </div>
    )}
  </div>
);

const toolTip = (title, iconType) => {
  return (
    <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
      <Icon type={iconType} style={{ marginLeft: 4 }} />
    </Tooltip>
  );
};

const paymentProgressReportCard = (tooltipTitle, iconType, amount, count, description) => {
  return (
    <Col xl={{ span: 8 }} className="payment-summary-card">
      <Tooltip title={tooltipTitle} placement="top" mouseEnterDelay={0.3}>
        <Row>
          <Title level={4}>{formatMoney(amount)} </Title>
          <Paragraph>({count} items)</Paragraph>
          <Paragraph>
            <Icon type={iconType} style={{ marginRight: 4 }} />
            {description}
          </Paragraph>
        </Row>
      </Tooltip>
    </Col>
  );
};

const paymentsProgressReports = (
  infoRequiredCount,
  inReviewCount,
  approvedCount,
  infoRequiredAmount = 0,
  inReviewAmount = 0,
  approvedAmount = 0
) => {
  return (
    <Row>
      {paymentProgressReportCard(
        "Estimated financial contribution  for all work items for which you have not submitted a payment request.",
        "info-circle",
        infoRequiredAmount,
        infoRequiredCount,
        "Information Required"
      )}
      {paymentProgressReportCard(
        "Maximum  financial contribution for all work items with the status Ready for Review.",
        "clock-circle",
        inReviewAmount,
        inReviewCount,
        "In Review"
      )}
      {paymentProgressReportCard(
        "Total of approved financial contributions for work items in this application.",
        "check-circle",
        approvedAmount,
        approvedCount,
        "Approved"
      )}
    </Row>
  );
};

const calculatePaymentSummary = (workItems, paymentType, percent) => {
  let informationRequiredTotal = 0;
  let readyForReviewTotal = 0;
  let approvedTotal = 0;
  workItems.forEach((item) => {
    const amounts = Payment.calculateEstimatedFinancialContribution(paymentType, item);
    if (item.contracted_work_payment === null) {
      informationRequiredTotal += Payment.getTypeEstSharedCost(
        percent,
        item.estimated_shared_cost ?? 0
      );
    } else if (
      item.contracted_work_payment &&
      item.contracted_work_payment[`${paymentType}_payment_status_code`] ===
        CONTRACTED_WORK_PAYMENT_STATUS.READY_FOR_REVIEW
    ) {
      readyForReviewTotal += amounts.maxAmount;
    } else if (
      item.contracted_work_payment &&
      item.contracted_work_payment[`${paymentType}_payment_status_code`] ===
        CONTRACTED_WORK_PAYMENT_STATUS.APPROVED
    ) {
      approvedTotal += item.contracted_work_payment[`${paymentType}_paid_amount`] ?? 0;
    }
    
  });

  return {
    informationRequiredTotal,
    readyForReviewTotal,
    approvedTotal,
  };
};

export class ContractedWorkPaymentView extends Component {
  state = { isLoaded: false };

  componentDidMount = () => {
    this.loadApprovedContractedWork();
  };

  loadApprovedContractedWork = () => {
    this.setState({ isLoaded: false });
    this.props.fetchApplicationApprovedContractedWorkById(this.props.applicationGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleRefresh = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.loadApprovedContractedWork();
  };

  transformRowData = (applicationApprovedContractedWork) => {
    const data = applicationApprovedContractedWork.map((work) => {
      const contracted_work_payment = work.contracted_work_payment || {};
      const { interim_payment_submission_date } = contracted_work_payment;
      let interim_report_deadline = Infinity;
      if (interim_payment_submission_date) {
        if (contracted_work_payment.interim_report) {
          interim_report_deadline = -Infinity;
        } else {
          const daysToSubmit = 30;
          interim_report_deadline = moment(interim_payment_submission_date).add(
            daysToSubmit,
            "days"
          );
        }
      }
      return {
        ...work,
        key: work.work_id,
        contracted_work_type_description: startCase(camelCase(work.contracted_work_type)),
        interim_cost: parseFloat(contracted_work_payment.interim_actual_cost),
        final_cost: parseFloat(contracted_work_payment.final_actual_cost),
        interim_status_description:
          (contracted_work_payment.interim_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.interim_payment_status_code
            ]) ||
          "Information Required",
        final_status_description:
          (contracted_work_payment.final_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.final_payment_status_code
            ]) ||
          "Information Required",
        interim_report_deadline,
        work,
      };
    });
    return data;
  };

  openContractedWorkPaymentModal = (record) => {
    // Set the default active tab to be the most relevant one for this work item.
    let activeKey = "final_payment";
    const contractedWorkPayment = record.contracted_work_payment;
    if (
      !contractedWorkPayment ||
      contractedWorkPayment.interim_payment_status_code ===
        CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED
    ) {
      activeKey = "interim_payment";
    } else if (isEmpty(contractedWorkPayment.interim_report)) {
      activeKey = "interim_progress_report";
    }

    return this.props.openModal({
      props: {
        title: `Provide Payment Information for Work ID ${record.work_id}`,
        contractedWorkPayment: record.work,
        applicationSummary: this.props.applicationSummary,
        activeKey,
        handleSubmitInterimContractedWorkPayment: this.handleSubmitInterimContractedWorkPayment,
        handleSubmitFinalContractedWorkPayment: this.handleSubmitFinalContractedWorkPayment,
        handleSubmitInterimContractedWorkPaymentProgressReport: this
          .handleSubmitInterimContractedWorkPaymentProgressReport,
      },
      content: modalConfig.CONTRACTED_WORK_PAYMENT,
    });
  };

  handleSubmitInterimContractedWorkPayment = (contractedWorkPayment, values) =>
    this.props
      .updateContractedWorkPaymentInterim(
        this.props.applicationGuid,
        contractedWorkPayment.work_id,
        values
      )
      .then(() => {
        this.props.closeModal();
        this.loadApprovedContractedWork();
      });

  handleSubmitFinalContractedWorkPayment = (contractedWorkPayment, values) =>
    this.props
      .updateContractedWorkPaymentFinal(
        this.props.applicationGuid,
        contractedWorkPayment.work_id,
        values
      )
      .then(() => {
        this.props.closeModal();
        this.loadApprovedContractedWork();
      });

  handleSubmitInterimContractedWorkPaymentProgressReport = (contractedWorkPayment, values) =>
    this.props
      .updateContractedWorkPaymentInterimReport(
        this.props.applicationGuid,
        contractedWorkPayment.work_id,
        values
      )
      .then(() => {
        this.props.closeModal();
        this.loadApprovedContractedWork();
      });

  render() {
    const columns = [
      {
        title: "Work Information",
        children: [
          {
            title: "Work ID",
            key: "work_id",
            dataIndex: "work_id",
            sorter: (a, b) =>
              Number(a.work_id.split(".")[1]) > Number(b.work_id.split(".")[1]) ? 1 : -1,
            render: (text) => <div title="Work ID">{text}</div>,
          },
          {
            title: "Well Auth No.",
            key: "well_authorization_number",
            dataIndex: "well_authorization_number",
            sorter: (a, b) =>
              isNaN(a.well_authorization_number) && isNaN(b.well_authorization_number)
                ? (a.well_authorization_number || "").localeCompare(
                    b.well_authorization_number || ""
                  )
                : a.well_authorization_number - b.well_authorization_number,
            render: (text) => <div title="Well Auth No.">{text}</div>,
          },
          {
            title: "Work Type",
            key: "contracted_work_type_description",
            dataIndex: "contracted_work_type_description",
            sorter: nullableStringOrNumberSorter("contracted_work_type_description"),
            render: (text) => <div title="Work Type">{text}</div>,
          },
          {
            title: "Est. Cost",
            key: "contracted_work_total",
            dataIndex: "contracted_work_total",
            className: "table-header-right-align table-column-right-align",
            sorter: nullableStringOrNumberSorter("contracted_work_total"),
            render: (text) => <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
          },
          {
            title: "End Date",
            key: "planned_end_date",
            dataIndex: "planned_end_date",
            sorter: dateSorter("planned_end_date"),
            render: (text) => <div title="End Date">{formatDate(text)}</div>,
          },
        ],
      },
      {
        title: "Interim Submission",
        className: "interim-submission",
        children: [
          {
            title: "Actual Cost",
            key: "interim_cost",
            dataIndex: "interim_cost",
            className: "interim-submission-left table-column-right-align table-header-right-align",
            sorter: nullableStringOrNumberSorter("interim_cost"),
            render: (text) => <div title="Actual Cost">{formatMoney(text) || Strings.DASH}</div>,
          },
          {
            title: "Status",
            key: "interim_status_description",
            dataIndex: "interim_status_description",
            sorter: nullableStringOrNumberSorter("interim_status_description"),
            render: (text, record) => {
              const note =
                record.contracted_work_payment &&
                record.contracted_work_payment.interim_payment_status
                  ? record.contracted_work_payment.interim_payment_status.note
                  : null;
              return (
                <div title="Status">
                  {note && popover(note, "table-record-tooltip color-warning")}
                  {text}
                </div>
              );
            },
          },
          {
            title: "Progress Report",
            key: "interim_report_deadline",
            dataIndex: "interim_report_deadline",
            sorter: nullableStringOrNumberSorter("interim_report_deadline"),
            className: "interim-submission-right",
            render: (text) => {
              let display = null;
              let overdue = false;
              if (text === -Infinity) {
                display = "Submitted";
              } else if (text === Infinity) {
                display = Strings.DASH;
              } else {
                display = `Due ${formatDate(text)}`;
                overdue = moment().isAfter(text);
              }
              return fieldWithTooltip(
                display,
                "Progress Report",
                "You cannot receive Final payment for this item until the Interim Progress Report is received",
                "history",
                overdue
              );
            },
          },
        ],
      },
      {
        title: "Final Submission",
        className: "final-submission-right",
        children: [
          {
            title: "Actual Cost",
            key: "final_cost",
            dataIndex: "final_cost",
            className: "table-header-right-align table-column-right-align",
            sorter: nullableStringOrNumberSorter("final_cost"),
            render: (text) => <div title="Actual Cost">{formatMoney(text) || Strings.DASH}</div>,
          },
          {
            title: "Status",
            key: "final_status_description",
            dataIndex: "final_status_description",
            className: "final-submission-right",
            sorter: nullableStringOrNumberSorter("final_status_description"),
            render: (text, record) => {
              const note =
                record.contracted_work_payment &&
                record.contracted_work_payment.final_payment_status
                  ? record.contracted_work_payment.final_payment_status.note
                  : null;
              return (
                <div title="Status">
                  {note && popover(note, "table-record-tooltip color-warning")}
                  {text}
                </div>
              );
            },
          },
        ],
      },
      {
        title: "",
        children: [
          {
            title: "Request Payment",
            key: "request_payment",
            className: "table-header-center-align table-column-center-align",
            render: (text, record) => (
              <Button type="link" onClick={() => this.openContractedWorkPaymentModal(record)}>
                <Icon type="form" className="icon-lg" />
              </Button>
            ),
          },
        ],
      },
    ];

    const dataSource = this.transformRowData(this.props.applicationApprovedContractedWork).sort(
      contractedWorkIdSorter
    );
    const countOfApprovedWork = dataSource.length;

    // Determine how many contracted work items have been approved.
    const interimApprovedCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        contracted_work_payment &&
        contracted_work_payment.interim_payment_status_code ===
          CONTRACTED_WORK_PAYMENT_STATUS.APPROVED
    ).length;

    const finalApprovedCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        contracted_work_payment &&
        contracted_work_payment.final_payment_status_code ===
          CONTRACTED_WORK_PAYMENT_STATUS.APPROVED
    ).length;

    // Determine how many contracted work items still require information to be submitted.
    const interimInfoRequiredCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        !contracted_work_payment ||
        contracted_work_payment.interim_payment_status_code ===
          CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED // ||
      //! contracted_work_payment.interim_report
    ).length;
    const finalInfoRequiredCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        !contracted_work_payment ||
        contracted_work_payment.final_payment_status_code ===
          CONTRACTED_WORK_PAYMENT_STATUS.INFORMATION_REQUIRED
    ).length;

    // Payments summary calculation
    const interimSummary = calculatePaymentSummary(
      dataSource,
      PAYMENT_TYPES.INTERIM,
      Payment.interimPercent
    );
    const finalSummary = calculatePaymentSummary(
      dataSource,
      PAYMENT_TYPES.FINAL,
      Payment.finalPercent
    );

    return (
      <Row>
        <Col>
          <Row>
            <Col>
              <Title level={1}>Interim and Final Payments</Title>
              <Row align="middle">
                <br />
                <Col xl={{ span: 12 }} className="border-right-primary" align="middle">
                  <Title level={3}>Interim Summary</Title>
                  {paymentsProgressReports(
                    interimInfoRequiredCount,
                    countOfApprovedWork - (interimInfoRequiredCount + interimApprovedCount),
                    interimApprovedCount,
                    interimSummary.informationRequiredTotal,
                    interimSummary.readyForReviewTotal,
                    interimSummary.approvedTotal
                  )}
                </Col>
                <Col xl={{ span: 12 }} align="middle">
                  <Title level={3}>Final Summary</Title>
                  {paymentsProgressReports(
                    finalInfoRequiredCount,
                    countOfApprovedWork - (finalInfoRequiredCount + finalApprovedCount),
                    finalApprovedCount,
                    finalSummary.informationRequiredTotal,
                    finalSummary.readyForReviewTotal,
                    finalSummary.approvedTotal
                  )}
                </Col>
              </Row>
              <br />
              <br />
              <Paragraph>
                This table shows all of the work items from your application that qualified for the
                program. It also shows you the status of your Interim and Final payment requests for
                those items.
              </Paragraph>
              <Paragraph>
                To submit a payment request, click on a work item's Request Payment icon and
                complete the form.
              </Paragraph>
              <Paragraph>
                You must submit these completed forms with your payment requests.
                <ul>
                  <li>
                    <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Evidence of Cost
                    </a>
                    &nbsp;- Interim and Final payments
                  </li>
                  <li>
                    <a href={FINAL_REPORT_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Final Reports
                    </a>
                    &nbsp;- Final payment only (must be completed by a Qualified Professional such
                    as an Engineer, Agrologist or Biologist).
                  </li>
                </ul>
              </Paragraph>
              <Paragraph>
                All Final Report and Evidence of Cost documents must be submitted as PDFs.
              </Paragraph>
              <Paragraph>
                If you have any questions or concerns, contact&nbsp;
                <a href={`mailto:${Strings.HELP_EMAIL}`}>{Strings.HELP_EMAIL}</a>.
              </Paragraph>
              <div style={{ float: "right" }}>
                <Button type="link" onClick={this.handleRefresh}>
                  <Icon type="reload" className="icon-lg" />
                  Refresh
                </Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table
                columns={columns}
                pagination={false}
                locale={{
                  emptyText:
                    "This application does not contain any approved contracted work items! Please contact us.",
                }}
                dataSource={dataSource}
                loading={{
                  spinning: !this.state.isLoaded,
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  applicationApprovedContractedWork: getApplicationApprovedContractedWork(state),
  contractedWorkPaymentStatusOptionsHash: getContractedWorkPaymentStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationApprovedContractedWorkById,
      updateContractedWorkPaymentInterim,
      updateContractedWorkPaymentFinal,
      updateContractedWorkPaymentInterimReport,
      openModal,
      closeModal,
    },
    dispatch
  );

ContractedWorkPaymentView.propTypes = propTypes;
ContractedWorkPaymentView.defaultProps = defaultProps;

export default compose(connect(mapStateToProps, mapDispatchToProps))(ContractedWorkPaymentView);
