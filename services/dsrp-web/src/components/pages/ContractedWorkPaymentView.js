import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import { startCase, camelCase, round, isEmpty } from "lodash";
import { Row, Col, Typography, Table, Icon, Button, Popover, Progress } from "antd";
import { formatDate, formatMoney, nullableStringOrNumberSorter, dateSorter } from "@/utils/helpers";
import {
  fetchApplicationApprovedContractedWorkById,
  updateContractedWorkPaymentInterim,
  updateContractedWorkPaymentFinal,
  updateContractedWorkPaymentInterimReport,
} from "@/actionCreators/applicationActionCreator";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import { getApplicationApprovedContractedWork } from "@/selectors/applicationSelectors";
import { getContractedWorkPaymentStatusOptionsHash } from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import LinkButton from "@/components/common/LinkButton";
import { contractedWorkIdSorter } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { EOC_TEMPLATE, FINAL_REPORT_TEMPLATE } from "@/constants/assets";

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
  <Popover title="Admin Note" content={message}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Popover>
);

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
      contractedWorkPayment.interim_payment_status_code === "INFORMATION_REQUIRED"
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
        activeKey: activeKey,
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
            title: "Interim Cost",
            key: "interim_cost",
            dataIndex: "interim_cost",
            className: "interim-submission-left",
            sorter: nullableStringOrNumberSorter("interim_cost"),
            render: (text) => <div title="Interim Cost">{formatMoney(text) || Strings.DASH}</div>,
          },
          {
            title: "Interim Status",
            key: "interim_status_description",
            dataIndex: "interim_status_description",
            sorter: nullableStringOrNumberSorter("interim_status_description"),
            render: (text, record) => {
              const statusCode =
                record.contracted_work_payment &&
                record.contracted_work_payment.interim_payment_status_code;
              const note =
                record.contracted_work_payment &&
                record.contracted_work_payment.interim_payment_status
                  ? record.contracted_work_payment.interim_payment_status.note
                  : null;
              return (
                <div title="Interim Status">
                  {note && popover(note, "table-record-tooltip color-warning")}
                  {text}
                </div>
              );
            },
          },
          {
            title: "Progress Report Status",
            key: "interim_report_deadline",
            dataIndex: "interim_report_deadline",
            sorter: nullableStringOrNumberSorter("interim_report_deadline"),
            className: "interim-submission-right",
            render: (text) => {
              let display = null;
              if (text === -Infinity) {
                display = "Submitted";
              } else if (text === Infinity) {
                display = Strings.DASH;
              } else {
                display = `Due ${formatDate(text)}`;
              }
              return <div title="Progress Report Status">{display}</div>;
            },
          },
        ],
      },
      {
        title: "Final Submission",
        className: "final-submission-right",
        children: [
          {
            title: "Final Cost",
            key: "final_cost",
            dataIndex: "final_cost",
            sorter: nullableStringOrNumberSorter("final_cost"),
            render: (text) => <div title="Final Cost">{formatMoney(text) || Strings.DASH}</div>,
          },
          {
            title: "Final Status",
            key: "final_status_description",
            dataIndex: "final_status_description",
            className: "final-submission-right",
            sorter: nullableStringOrNumberSorter("final_status_description"),
            render: (text, record) => {
              const statusCode =
                record.contracted_work_payment &&
                record.contracted_work_payment.final_payment_status_code;
              const note =
                record.contracted_work_payment &&
                record.contracted_work_payment.final_payment_status
                  ? record.contracted_work_payment.final_payment_status.note
                  : null;
              return (
                <div title="Final Status">
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
            key: "operations",
            render: (text, record) => (
              <div style={{ float: "right" }}>
                <Button type="link" onClick={() => this.openContractedWorkPaymentModal(record)}>
                  <Icon type="form" className="icon-lg" />
                </Button>
              </div>
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
        contracted_work_payment.interim_payment_status_code === "APPROVED"
    ).length;
    const finalApprovedCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        contracted_work_payment && contracted_work_payment.final_payment_status_code === "APPROVED"
    ).length;

    // Determine how many contracted work items still require information to be submitted.
    const interimInfoRequiredCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        !contracted_work_payment ||
        contracted_work_payment.interim_payment_status_code === "INFORMATION_REQUIRED" // ||
      //! contracted_work_payment.interim_report
    ).length;
    const finalInfoRequiredCount = dataSource.filter(
      ({ contracted_work_payment }) =>
        !contracted_work_payment ||
        contracted_work_payment.final_payment_status_code === "INFORMATION_REQUIRED"
    ).length;

    const interimApprovedPercent = (interimApprovedCount / countOfApprovedWork) * 100;
    const finalApprovedPercent = (finalApprovedCount / countOfApprovedWork) * 100;
    const interimTotalPercent =
      ((countOfApprovedWork - interimInfoRequiredCount) / countOfApprovedWork) * 100;
    const finalTotalPercent =
      ((countOfApprovedWork - finalInfoRequiredCount) / countOfApprovedWork) * 100;

    return (
      <Row>
        <Col>
          <Row gutter={64} type="flex" justify="center" align="middle">
            <Col md={24} lg={12}>
              <Title level={4}>Interim Payment Submission Progress</Title>
              <Row gutter={16} type="flex" justify="space-around" align="middle">
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="check-circle" style={{ marginRight: 5 }} />
                    Approved
                  </Text>
                  <br />
                  {interimApprovedCount}
                </Col>
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="clock-circle" style={{ marginRight: 5 }} />
                    Ready for Review
                  </Text>
                  <br />
                  {countOfApprovedWork - (interimInfoRequiredCount + interimApprovedCount)}
                </Col>
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="info-circle" style={{ marginRight: 5 }} />
                    Information Required
                  </Text>
                  <br />
                  {interimInfoRequiredCount}
                </Col>
              </Row>
              <Progress
                percent={interimTotalPercent}
                successPercent={interimApprovedPercent}
                format={(percent) => round(percent, 1) + "%"}
              />
              <Text type="secondary">
                Interim payment information is required for {interimInfoRequiredCount} contracted
                work items.
              </Text>
            </Col>
            <Col md={24} lg={12}>
              <Title level={4}>Final Payment Submission Progress</Title>
              <Row gutter={16} type="flex" justify="space-around" align="middle">
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="check-circle" style={{ marginRight: 5 }} />
                    Approved
                  </Text>
                  <br />
                  {finalApprovedCount}
                </Col>
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="clock-circle" style={{ marginRight: 5 }} />
                    Ready for Review
                  </Text>
                  <br />
                  {countOfApprovedWork - (finalInfoRequiredCount + finalApprovedCount)}
                </Col>
                <Col style={{ textAlign: "center" }}>
                  <Text strong>
                    <Icon type="info-circle" style={{ marginRight: 5 }} />
                    Information Required
                  </Text>
                  <br />
                  {finalInfoRequiredCount}
                </Col>
              </Row>
              <Progress
                percent={finalTotalPercent}
                successPercent={finalApprovedPercent}
                format={(percent) => round(percent, 1) + "%"}
              />
              <Text type="secondary">
                Final payment information is required for {finalInfoRequiredCount} contracted work
                items.
              </Text>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col>
              <Title level={1}>Interim and Final Payments</Title>
              <Paragraph>This table shows all of the approved work for this application.</Paragraph>
              <Paragraph>
                The template documents required as part of interim and final payment submissions can
                be downloaded here:
                <ul>
                  <li>
                    <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Evidence of Cost Template
                    </a>
                  </li>
                  <li>
                    <a href={FINAL_REPORT_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Final Report Template
                    </a>
                  </li>
                </ul>
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
                  // delay: 500,
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
