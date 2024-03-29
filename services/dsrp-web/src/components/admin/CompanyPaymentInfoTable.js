import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Icon, Button, Row, Col, Typography } from "antd";
import * as Strings from "@/constants/strings";
import { modalConfig } from "@/components/modalContent/config";

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
  };

  openEditCompanyPaymentInfoModal = (record) =>
    this.props.openModal({
      width: 800,
      props: {
        title: `Edit Company Payment Information for ${record.company_name}`,
        companyPaymentInfo: record,
        onSubmit: this.props.handleUpdateCompanyPaymentInfo,
        isAdd: false,
      },
      content: modalConfig.ADMIN_EDIT_COMPANY_PAYMENT_INFO,
    });

  handleAddCompanyPaymentInfo = () => {
    this.openAddCompanyPaymentInfoModal();
  };

  openAddCompanyPaymentInfoModal = () =>
    this.props.openModal({
      width: 800,
      props: {
        title: "Add Company Payment Information",
        companyPaymentInfo: {},
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
        title: "PO Number 2",
        key: "po_number_2",
        dataIndex: "po_number_2",
        render: (text) => <div title="PO Number 2">{text || Strings.DASH}</div>,
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
          <Button type="link" onClick={() => this.handleEditCompanyPaymentInfo(record)}>
            <Icon type="edit" className="icon-lg" />
          </Button>
        ),
      },
    ];

    return (
      <>
        <Row>
          <Col>
            <div style={{ float: "right" }}>
              <Button type="link" onClick={() => this.handleAddCompanyPaymentInfo()}>
                <Icon type="plus-square" className="icon-lg" />
                Add New
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl={{ span: 24 }} xxl={{ span: 24 }}>
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
          </Col>
        </Row>
      </>
    );
  }
}

CompanyPaymentInfoTable.propTypes = propTypes;

export default CompanyPaymentInfoTable;
