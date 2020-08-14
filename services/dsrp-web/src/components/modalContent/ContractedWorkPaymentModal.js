import React, { Component } from "react";
import PropTypes from "prop-types";
import InterimContractedWorkPaymentForm from "@/components/forms/InterimContractedWorkPaymentForm";
import { Row, Col, Typography, Table, Icon, Button, Tabs } from "antd";

const { TabPane } = Tabs;

const propTypes = {};

export class ContractedWorkPaymentModal extends Component {
  handleUpdateStatus = (values) =>
    this.props.onSubmit(props.application.guid, {
      ...values,
    });

  render = () => {
    return (
      <Tabs type="card" className="ant-tabs-center">
        <TabPane tab="Interim Payment" key="0">
          <InterimContractedWorkPaymentForm
            onSubmit={this.handleUpdateStatus}
            closeModal={this.props.closeModal}
          />
        </TabPane>
        <TabPane tab="Final Payment" key="1"></TabPane>
        <TabPane tab="Interim Progress Report" key="2"></TabPane>
      </Tabs>
    );
  };
}

ContractedWorkPaymentModal.propTypes = propTypes;

export default ContractedWorkPaymentModal;
