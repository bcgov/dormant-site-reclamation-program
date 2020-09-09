import React, { Component } from "react";
import PropTypes from "prop-types";
import { capitalize, startCase, camelCase } from "lodash";
import { Table, Button, Row, Col, Popconfirm, Tooltip, Icon, Descriptions, Typography } from "antd";
import { formatMoney } from "@/utils/helpers";

const { Title, Paragraph, Text } = Typography;

const propTypes = {
  contractedWork: PropTypes.arrayOf(PropTypes.any).isRequired,
  paymentDocumentCode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class AdminCreatePaymentRequestFormModal extends Component {
  state = { submitting: false, selectedContractedWork: this.props.contractedWork };

  handleSubmit = () => {
    this.setState({ submitting: true });
    this.props
      .onSubmit(this.state.selectedContractedWork)
      .finally(() => this.setState({ submitting: false }));
  };

  handleRemoveWorkItem = (workId) => {
    this.setState((prevState) => ({
      selectedContractedWork: prevState.selectedContractedWork.filter(
        (work) => work.work_id != workId
      ),
    }));
  };

  render() {
    const paymentDocumentCode = this.props.paymentDocumentCode;
    let paymentType = null;
    if (paymentDocumentCode === "INTERIM_PRF") {
      paymentType = "interim";
    } else if (paymentDocumentCode === "FINAL_PRF") {
      paymentType = "final";
    } else {
      throw new Error("Unknown payment document code received!");
    }
    const paymentTypeDescription = capitalize(paymentType);

    const columns = [
      {
        title: "",
        key: `has_${paymentType}_prfs`,
        dataIndex: `has_${paymentType}_prfs`,
        render: (text) => (
          <div>
            {text && (
              <Tooltip
                title={`This work item has been used to generate ${paymentTypeDescription} PRFs`}
              >
                <Icon type="dollar" className="table-record-tooltip color-success" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Work ID",
        key: "work_id",
        dataIndex: "work_id",
        render: (text) => <div title="Work ID">{text}</div>,
      },
      {
        title: "Work Type",
        key: "contracted_work_type",
        dataIndex: "contracted_work_type",
        render: (text) => <div title="Work Type">{startCase(camelCase(text))}</div>,
      },
      {
        title: "Contribution",
        key: `${paymentType}_paid_amount`,
        dataIndex: `${paymentType}_paid_amount`,
        className: "table-column-right-align",
        render: (text) => <div title="">{formatMoney(text)}</div>,
      },
      {
        title: "Action",
        key: "action",
        className: "table-header-center-align table-column-center-align",
        render: (text, record) => (
          <div>
            {!record.isTotalRow && (
              <Button
                type="link"
                onClick={() => this.handleRemoveWorkItem(record.work_id)}
                className="font-size-small"
                disabled={this.state.selectedContractedWork.length === 1 || this.state.submitting}
              >
                Remove
              </Button>
            )}
          </div>
        ),
      },
    ];

    const totalContribution = this.state.selectedContractedWork.reduce(
      (sum, work) => sum + parseFloat(work[`${paymentType}_paid_amount`]),
      0
    );
    const totalRow = {
      isTotalRow: true,
      [`${paymentType}_paid_amount`]: totalContribution,
    };

    const dataSource = [...this.state.selectedContractedWork, totalRow];

    return (
      <>
        <Row>
          <Col>
            <Descriptions title="Application Information" column={1}>
              <Descriptions.Item label="Application Reference Number">
                {this.props.contractedWork[0].application_guid}
              </Descriptions.Item>
              <Descriptions.Item label="Application ID">
                {this.props.contractedWork[0].application_id}
              </Descriptions.Item>
              <Descriptions.Item label="Company Name">
                {this.props.contractedWork[0].company_name}
              </Descriptions.Item>
            </Descriptions>

            <br />
            <Title level={4}>Selected Work Items</Title>
            <Table
              columns={columns}
              pagination={false}
              rowKey={(record) => record.work_id}
              dataSource={dataSource}
              className="total-row-table"
            />

            <Paragraph>
              Confirm that the application information and selected work items are correct before
              generating and sending the <Text strong>{paymentType} payment request form</Text>.
            </Paragraph>
            <br />
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="right">
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={this.props.closeModal}
                okText="Yes"
                cancelText="No"
                disabled={this.state.submitting}
              >
                <Button type="secondary" disabled={this.state.submitting}>
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 5 }}
                loading={this.state.submitting}
                onClick={this.handleSubmit}
              >
                Generate and Send {paymentTypeDescription} PRF
              </Button>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

AdminCreatePaymentRequestFormModal.propTypes = propTypes;

export default AdminCreatePaymentRequestFormModal;
