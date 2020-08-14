import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { startCase, camelCase } from "lodash";
import { Row, Col, Typography, Table, Icon, Button } from "antd";
import {
  formatDate,
  formatMoney,
  nullableStringSorter,
  nullableNumberSorter,
} from "@/utils/helpers";
import { fetchApplicationApprovedContractedWorkById } from "@/actionCreators/applicationActionCreator";
import { getApplicationApprovedContractedWork } from "@/selectors/applicationSelectors";
import { getContractedWorkPaymentStatusOptionsHash } from "@/selectors/staticContentSelectors";
import CONTRACT_WORK_SECTIONS from "@/constants/contract_work_sections";
import * as Strings from "@/constants/strings";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";

const propTypes = {
  applicationGuid: PropTypes.string.isRequired,
  applicationApprovedContractedWork: PropTypes.arrayOf(PropTypes.any).isRequired,
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
        interim_cost:
          (!isNaN(contracted_work_payment.interim_actual_cost) &&
            formatMoney(contracted_work_payment.interim_actual_cost)) ||
          undefined,
        final_cost:
          (!isNaN(contracted_work_payment.final_actual_cost) &&
            formatMoney(contracted_work_payment.final_actual_cost)) ||
          undefined,
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
      };
    });
    return data;
  };

  openContractedWorkPaymentModal = (record) => {
    console.log(record);
    return this.props.openModal({
      props: {
        title: `Provide Information for Work ID ${record.work_id}`,
      },
      content: modalConfig.CONTRACTED_WORK_PAYMENT,
    });
  };

  render() {
    const columns = [
      {
        title: "Work ID",
        dataIndex: "work_id",
        sorter: (a, b) =>
          Number(a.work_id.split(".")[1]) > Number(b.work_id.split(".")[1]) ? 1 : -1,
        render: (text) => {
          return <div title="Work ID">{text}</div>;
        },
      },
      {
        title: "Well Auth No.",
        dataIndex: "well_authorization_number",
        render: (text) => {
          return <div title="Well Auth No.">{text}</div>;
        },
      },
      {
        title: "Work Type",
        dataIndex: "contracted_work_type_description",
        render: (text) => {
          return <div title="Work Type">{text}</div>;
        },
      },
      {
        title: "Est. Cost",
        dataIndex: "contracted_work_total",
        render: (text) => {
          return <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>;
        },
      },
      {
        title: "Completion Date",
        dataIndex: "planned_end_date",
        render: (text) => {
          return <div title="Completion Date">{formatDate(text)}</div>;
        },
      },
      {
        title: "Interim Cost",
        dataIndex: "interim_cost",
        render: (text) => {
          return <div title="Interim Cost">{formatMoney(text) || Strings.DASH}</div>;
        },
      },
      {
        title: "Interim EoC",
        dataIndex: "interim_eoc",
        render: (text) => {
          return <div title="Interim EoC">{text || Strings.DASH}</div>;
        },
      },
      {
        title: "Interim Status",
        dataIndex: "interim_status",
        render: (text) => {
          return <div title="Interim Status">{text}</div>;
        },
      },
      {
        title: "Final Cost",
        dataIndex: "final_cost",
        render: (text) => {
          return <div title="Final Cost">{formatMoney(text) || Strings.DASH}</div>;
        },
      },
      {
        title: "Final EoC",
        dataIndex: "final_eoc",
        render: (text) => {
          return <div title="Final EoC">{text || Strings.DASH}</div>;
        },
      },
      {
        title: "Final Status",
        dataIndex: "final_status",
        render: (text) => {
          return <div title="Final Status">{text}</div>;
        },
      },
      {
        render: (text, record) => (
          <>
            <Button type="link" onClick={() => this.openContractedWorkPaymentModal(record)}>
              <Icon type="form" className="icon-lg" />
            </Button>
          </>
        ),
      },
    ];

    const dataSource = this.transformRowData(
      this.props.applicationApprovedContractedWork.approved_contracted_work
    );

    console.log(dataSource);

    return (
      <Row>
        <Col>
          <Table
            columns={columns}
            pagination={false}
            rowKey={(record) => record.work_id}
            locale={{
              emptyText:
                "This application does not contain any approved contracted work items! Please contact us.",
            }}
            dataSource={dataSource}
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
      openModal,
      closeModal,
    },
    dispatch
  );

ContractedWorkPaymentView.propTypes = propTypes;
ContractedWorkPaymentView.defaultProps = defaultProps;

export default compose(connect(mapStateToProps, mapDispatchToProps))(ContractedWorkPaymentView);
