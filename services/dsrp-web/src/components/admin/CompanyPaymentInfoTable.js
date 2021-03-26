import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty, startCase, camelCase } from "lodash";
import {
  Table,
  Icon,
  Pagination,
  Input,
  Button,
  Popover,
  Tooltip,
  Divider,
  Row,
  Col,
  Typography,
} from "antd";
import { formatMoney, formatDate, formatDateTimeFine } from "@/utils/helpers";
import { openModal, closeModal } from "@/actions/modalActions";

import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";

const { Text } = Typography;

const propTypes = {
  params: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  pageData: PropTypes.any.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleUpdateCompanyPaymentInfo: PropTypes.func.isRequired,
  handleCreateCompanyPaymentInfo: PropTypes.func.isRequired,
};

export class CompanyPaymentInfoTable extends Component {
  handleEditCompanyPaymentInfo = (record) => {
    this.openEditCompanyPaymentInfoModal(record);
  }

  openEditCompanyPaymentInfoModal = (record) =>
    this.props.openModal({
      width: 800,
      props: {
        title: `Edit Payment Information for Company ${record.company_name}`,
        cpi: record,
        onSubmit: this.props.handleUpdateCompanyPaymentInfo,
        isAdd: false,
      },
      content: modalConfig.ADMIN_EDIT_COMPANY_PAYMENT_INFO,
    });

  handleAddCompanyPaymentInfo = () => {
    this.openAddCompanyPaymentInfoModal();
  }

  openAddCompanyPaymentInfoModal = () =>
    this.props.openModal({
      width: 800,
      props: {
        title: `Add Payment Information for a Company`,
        cpi: {},
        onSubmit: this.props.handleCreateCompanyPaymentInfo,
        isAdd: true,
      },
      content: modalConfig.ADMIN_EDIT_COMPANY_PAYMENT_INFO,
    });

  render() {
    const columns = [
      {
        title: "Company Name",
        key: "company_name",
        dataIndex: "company_name",
        sortField: "company_name",
        render: (text) => <div title="Company Name">{text}</div>,
      },
      {
        title: "Company Address",
        key: "company_address",
        dataIndex: "company_address",
        render: (text) => <div title="Company Address">{text}</div>,
      },
      {
        title: "PO Number",
        key: "po_number",
        dataIndex: "po_number",
        render: (text) => <div title="PO Number">{text}</div>,
      },
      {
        title: "Qualified Receiver Name",
        key: "qualified_receiver_name",
        dataIndex: "qualified_receiver_name",
        render: (text) => <div title="Qualfiied Receiver Name">{text}</div>,
      },
      {
        title: "Expense Authority Name",
        key: "expense_authority_name",
        dataIndex: "expense_authority_name",
        render: (text) => <div title="Expense Authority Name">{text}</div>,
      },
      {
        title: "Edit",
        key: "edit",
        className: "table-header-center-align table-column-center-align",
        render: (text, record) => (
          <Button
            type="link"
            onClick={() => this.handleEditCompanyPaymentInfo(record)}
          >
            <Icon type="edit" className="icon-lg" />
          </Button>
        ),
      },
    ];

    return (
      <>
        <Row type="flex" justify="center" align="top" className="landing-section">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Button
              type="link"
              onClick={() => this.handleAddCompanyPaymentInfo()}
              style={{ float: "right", marginTop: 40 }}
            >
              Add New
              <Icon type="plus-square" className="icon-lg" />
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          pagination={false}
          rowKey={(record) => record.company_name}
          dataSource={this.props.pageData}
          className="table-headers-center"
          loading={{
            spinning: !this.props.isLoaded,
          }}
        />
      </>
    );
  }
}

CompanyPaymentInfoTable.propTypes = propTypes;

export default CompanyPaymentInfoTable;
