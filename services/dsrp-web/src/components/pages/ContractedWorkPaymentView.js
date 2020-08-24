import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import { startCase, camelCase, round } from "lodash";
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

const propTypes = {
  applicationGuid: PropTypes.string.isRequired,
  applicationApprovedContractedWork: PropTypes.arrayOf(PropTypes.any).isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.objectOf(PropTypes.any),
  fetchApplicationApprovedContractedWorkById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
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
      let interim_report_days_until_deadline = Infinity;
      if (interim_payment_submission_date) {
        if (contracted_work_payment.interim_report) {
          interim_report_days_until_deadline = -Infinity;
        } else {
          const daysToSubmit = 30;
          let daysLeftCount =
            daysToSubmit -
            (moment() - moment(interim_payment_submission_date)) / (1000 * 60 * 60 * 24);
          daysLeftCount = Math.round(daysLeftCount);
          interim_report_days_until_deadline = daysLeftCount;
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
        interim_eoc: contracted_work_payment.interim_eoc_application_document_guid,
        final_eoc: contracted_work_payment.final_eoc_application_document_guid,
        interim_report_days_until_deadline,
        work,
      };
    });
    return data;
  };

  openContractedWorkPaymentModal = (record) =>
    this.props.openModal({
      props: {
        title: `Provide Payment Information for Work ID ${record.work_id}`,
        contractedWorkPayment: record.work,
        handleSubmitInterimContractedWorkPayment: this.handleSubmitInterimContractedWorkPayment,
        handleSubmitFinalContractedWorkPayment: this.handleSubmitFinalContractedWorkPayment,
        handleSubmitInterimContractedWorkPaymentProgressReport: this
          .handleSubmitInterimContractedWorkPaymentProgressReport,
      },
      content: modalConfig.CONTRACTED_WORK_PAYMENT,
    });

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
            ? (a.well_authorization_number || "").localeCompare(b.well_authorization_number || "")
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
      {
        title: "Interim Cost",
        key: "interim_cost",
        dataIndex: "interim_cost",
        sorter: nullableStringOrNumberSorter("interim_cost"),
        render: (text) => <div title="Interim Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      // {
      //   title: "Interim EoC",
      //   key: "interim_eoc",
      //   dataIndex: "interim_eoc",
      //   render: (text) => (
      //     <div title="Interim EoC">
      //       {(text && (
      //         <LinkButton
      //           onClick={() =>
      //             downloadDocument(
      //               this.props.applicationGuid,
      //               text,
      //               "Dormant Sites Reclamation Program - Evidence of Cost.pdf"
      //             )
      //           }
      //         >
      //           Download
      //         </LinkButton>
      //       )) ||
      //         Strings.DASH}
      //     </div>
      //   ),
      // },
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
            record.contracted_work_payment && record.contracted_work_payment.interim_payment_status
              ? record.contracted_work_payment.interim_payment_status.note
              : null;
          return (
            <div title="Interim Status">
              {note && popover(note, "table-record-tooltip")}
              {text}
            </div>
          );
        },
      },
      {
        title: "Progress Report Status",
        key: "interim_report_days_until_deadline",
        dataIndex: "interim_report_days_until_deadline",
        sorter: nullableStringOrNumberSorter("interim_report_days_until_deadline"),
        render: (text) => {
          let display = null;
          if (text === -Infinity) {
            display = "Submitted";
          } else if (text === Infinity) {
            display = Strings.DASH;
          } else {
            display = `${text} days to submit`;
          }
          return <div title="Progress Report Status">{display}</div>;
        },
      },
      {
        title: "Final Cost",
        key: "final_cost",
        dataIndex: "final_cost",
        sorter: nullableStringOrNumberSorter("final_cost"),
        render: (text) => <div title="Final Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      // {
      //   title: "Final EoC",
      //   key: "final_eoc",
      //   dataIndex: "final_eoc",
      //   render: (text) => (
      //     <div title="Final EoC">
      //       {(text && (
      //         <LinkButton
      //           onClick={() =>
      //             downloadDocument(
      //               this.props.applicationGuid,
      //               text,
      //               "Dormant Sites Reclamation Program - Evidence of Cost.pdf"
      //             )
      //           }
      //         >
      //           Download
      //         </LinkButton>
      //       )) ||
      //         Strings.DASH}
      //     </div>
      //   ),
      // },
      {
        title: "Final Status",
        key: "final_status_description",
        dataIndex: "final_status_description",
        sorter: nullableStringOrNumberSorter("final_status_description"),
        render: (text, record) => {
          const statusCode =
            record.contracted_work_payment &&
            record.contracted_work_payment.final_payment_status_code;
          const note =
            record.contracted_work_payment && record.contracted_work_payment.final_payment_status
              ? record.contracted_work_payment.final_payment_status.note
              : null;
          return (
            <div title="Final Status">
              {note && popover(note, "table-record-tooltip")}
              {text}
            </div>
          );
        },
      },
      {
        key: "operations",
        render: (text, record) => (
          <div style={{ float: "right" }}>
            <Button type="link" onClick={() => this.openContractedWorkPaymentModal(record)}>
              <Icon type="form" className="icon-lg" />
            </Button>
          </div>
        ),
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
              <Title level={4}>Interim Payments Progress</Title>
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
                  {countOfApprovedWork - interimInfoRequiredCount}
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
              {/* <Text type="secondary">
                Final payment information for {interimInfoRequiredCount} work items is required.
              </Text> */}
            </Col>
            <Col md={24} lg={12}>
              <Title level={4}>Final Payments Progress</Title>
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
                  {countOfApprovedWork - finalInfoRequiredCount}
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
              {/* <Text type="secondary">
                Final payment information for {finalInfoRequiredCount} work items is required.
              </Text> */}
            </Col>
          </Row>
          <br />
          <br />
          <Title level={2}>
            Approved Contracted Work Payment Information
            <Button type="link" onClick={this.handleRefresh} style={{ float: "right" }}>
              <Icon type="reload" className="icon-lg" />
              Refresh
            </Button>
          </Title>
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
              delay: 500,
            }}
          />
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
