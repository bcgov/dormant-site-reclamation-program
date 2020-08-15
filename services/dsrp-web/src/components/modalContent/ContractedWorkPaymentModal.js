import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import InterimContractedWorkPaymentForm from "@/components/forms/InterimContractedWorkPaymentForm";

const { TabPane } = Tabs;

const propTypes = {
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
};

export class ContractedWorkPaymentModal extends Component {
  handleSubmitInterimContractedWorkPayment = (values) =>
    this.props.handleSubmitInterimContractedWorkPayment(this.props.contractedWorkPayment, values);
  handleSubmitFinalContractedWorkPayment = (values) =>
    this.props.handleSubmitFinalContractedWorkPayment(this.props.contractedWorkPayment, values);
  handleSubmitInterimContractedWorkPaymentProgressReport = (values) =>
    this.props.handleSubmitInterimContractedWorkPaymentProgressReport(
      this.props.contractedWorkPayment,
      values
    );

  render = () => {
    console.log("ContractedWorkPaymentModal", this.props);
    return (
      <Tabs type="card" className="ant-tabs-center">
        <TabPane tab="Interim Payment" key="0">
          <InterimContractedWorkPaymentForm
            onSubmit={this.handleSubmitInterimContractedWorkPayment}
            closeModal={this.props.closeModal}
          />
        </TabPane>
        <TabPane tab="Final Payment" key="1" disabled />
        <TabPane tab="Interim Progress Report" key="2" disabled />
      </Tabs>
    );
  };
}

ContractedWorkPaymentModal.propTypes = propTypes;

export default ContractedWorkPaymentModal;
