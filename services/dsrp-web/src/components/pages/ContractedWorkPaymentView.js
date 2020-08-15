import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { startCase, camelCase } from "lodash";
import { Row, Col, Typography, Table, Icon, Button } from "antd";
import {
  formatDate,
  formatMoney,
  nullableStringOrNumberSorter,
  nullableNumberSorter,
  dateSorter,
} from "@/utils/helpers";
import {
  fetchApplicationApprovedContractedWorkById,
  updateApplicationContractedWorkPaymentInterim,
} from "@/actionCreators/applicationActionCreator";
import { getApplicationApprovedContractedWork } from "@/selectors/applicationSelectors";
import { getContractedWorkPaymentStatusOptionsHash } from "@/selectors/staticContentSelectors";
import CONTRACT_WORK_SECTIONS from "@/constants/contract_work_sections";
import * as Strings from "@/constants/strings";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";

const propTypes = {
  applicationGuid: PropTypes.string.isRequired,
  applicationApprovedContractedWork: PropTypes.objectOf(PropTypes.any).isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.objectOf(PropTypes.any),
  fetchApplicationApprovedContractedWorkById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
};

const defaultProps = {
  applicationApprovedContractedWork: { approved_contracted_work: [] },
};

const { Paragraph, Title, Text } = Typography;

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

  transformRowData = (applicationApprovedContractedWork) => {
    const data = applicationApprovedContractedWork.map((work) => {
      const contracted_work_payment = work.contracted_work_payment || {};
      return {
        ...work,
        key: work.work_id,
        contracted_work_type_description: startCase(camelCase(work.contracted_work_type)),
        interim_cost: parseFloat(contracted_work_payment.interim_actual_cost),
        final_cost: parseFloat(contracted_work_payment.final_actual_cost),
        interim_status:
          (contracted_work_payment.interim_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.interim_payment_status_code
            ]) ||
          "Information Required",
        final_status:
          (contracted_work_payment.final_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.final_payment_status_code
            ]) ||
          "Information Required",
        interim_eoc: null,
        final_eoc: null,
        work: work,
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
      .updateApplicationContractedWorkPaymentInterim(
        this.props.applicationGuid,
        contractedWorkPayment.work_id,
        values
      )
      .then(() => {
        // this.props.closeModal();
        this.loadApprovedContractedWork();
      });

  handleSubmitFinalContractedWorkPayment = (contractedWorkPayment, values) => {
    console.log(contractedWorkPayment, values);
  };

  handleSubmitInterimContractedWorkPaymentProgressReport = (contractedWorkPayment, values) => {
    console.log(contractedWorkPayment, values);
  };

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
        title: "Est. Shared Cost",
        key: "estimated_shared_cost",
        dataIndex: "estimated_shared_cost",
        sorter: nullableStringOrNumberSorter("estimated_shared_cost"),
        render: (text) => <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      {
        title: "Completion Date",
        key: "planned_end_date",
        dataIndex: "planned_end_date",
        sorter: dateSorter("planned_end_date"),
        render: (text) => <div title="Completion Date">{formatDate(text)}</div>,
      },
      {
        title: "Interim Cost",
        key: "interim_cost",
        dataIndex: "interim_cost",
        sorter: nullableStringOrNumberSorter("interim_cost"),
        render: (text) => <div title="Interim Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      {
        title: "Interim EoC",
        key: "interim_eoc",
        dataIndex: "interim_eoc",
        render: (text) => <div title="Interim EoC">{text || Strings.DASH}</div>,
      },
      {
        title: "Interim Status",
        key: "interim_status",
        dataIndex: "interim_status",
        sorter: nullableStringOrNumberSorter("interim_status"),
        render: (text) => <div title="Interim Status">{text}</div>,
      },
      {
        title: "Final Cost",
        key: "final_cost",
        dataIndex: "final_cost",
        sorter: nullableStringOrNumberSorter("final_cost"),
        render: (text) => <div title="Final Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      {
        title: "Final EoC",
        key: "final_eoc",
        dataIndex: "final_eoc",
        render: (text) => <div title="Final EoC">{text || Strings.DASH}</div>,
      },
      {
        title: "Final Status",
        key: "final_status",
        dataIndex: "final_status",
        sorter: nullableStringOrNumberSorter("final_status"),
        render: (text) => <div title="Final Status">{text}</div>,
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

    return (
      <Row>
        <Col>
          <Table
            columns={columns}
            pagination={false}
            locale={{
              emptyText:
                "This application does not contain any approved contracted work items! Please contact us.",
            }}
            dataSource={this.transformRowData(
              this.props.applicationApprovedContractedWork.approved_contracted_work
            )}
            loading={!this.state.isLoaded}
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
      updateApplicationContractedWorkPaymentInterim,
      openModal,
      closeModal,
    },
    dispatch
  );

ContractedWorkPaymentView.propTypes = propTypes;
ContractedWorkPaymentView.defaultProps = defaultProps;

export default compose(connect(mapStateToProps, mapDispatchToProps))(ContractedWorkPaymentView);
