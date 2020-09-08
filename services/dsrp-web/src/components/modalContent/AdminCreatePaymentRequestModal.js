import React, { Component } from "react";
import PropTypes from "prop-types";
import { capitalize, startCase, camelCase } from "lodash";
import { Table, Button, Row, Col, Popconfirm } from "antd";

const propTypes = {
  contractedWork: PropTypes.arrayOf(PropTypes.any).isRequired,
  paymentDocumentCode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class AdminCreatePaymentRequestModal extends Component {
  state = { submitting: false, selectedRows: [] };

  handleSubmit = () => {
    this.setState({ submitting: true });
    this.props
      .onSubmit(this.state.selectedRows)
      .finally(() => this.setState({ submitting: false }));
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
        title: "Has PRFs",
        key: `has_${paymentType}_prfs`,
        dataIndex: `has_${paymentType}_prfs`,
        render: (text) => <div title="Has PRFs">{text}</div>,
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
        title: `${paymentTypeDescription} Contribution`,
        key: `${paymentType}_paid_amount`,
        dataIndex: `${paymentType}_paid_amount`,
        render: (text) => <div title="Work ID">{text}</div>,
      },
    ];

    console.log(this.props);

    return (
      <>
        <Row>
          <Col>
            <Table
              columns={columns}
              pagination={false}
              // rowSelection={rowSelection}
              rowKey={(record) => record.work_id}
              dataSource={this.props.contractedWork}
              // className="table-headers-center"
            />
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

AdminCreatePaymentRequestModal.propTypes = propTypes;

export default AdminCreatePaymentRequestModal;
