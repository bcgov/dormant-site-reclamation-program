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

import { updateCompanyPaymentInfo, createCompanyPaymentInfo, fetchCompanyPaymentInfos, fetchSelectedCompanyPaymentInfo } from "@/actionCreators/CPIActionCreator"
import { getCompanyPaymentInfos, getSelectedCompanyPaymentInfos } from "@/selectors/CPISelectors"

const { Text } = Typography;

const propTypes = {
  params: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  pageData: PropTypes.any.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class CompanyPaymentInfoTable extends Component {
  handleEditCompanyPaymentInfo = (record) => {
    console.log(this.props)
    this.openEditCompanyPaymentInfoModal(record);
  }

  openEditCompanyPaymentInfoModal = (record) => 
    this.props.openModal({
      width: 800,
      props: {
        title: `Edit Payment Information for Company ${record.company_name}`,
        cpi: record,
        onSubmit: console.log("submitted"),
        isAdd: false,
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
        sorter: true,
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

const mapStateToProps = (state) => ({


});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CompanyPaymentInfoTable);
