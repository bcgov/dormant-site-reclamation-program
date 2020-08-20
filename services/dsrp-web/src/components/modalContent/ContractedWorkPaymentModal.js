import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import InterimContractedWorkPaymentForm from "@/components/forms/InterimContractedWorkPaymentForm";
import FinalContractedWorkPaymentForm from "@/components/forms/FinalContractedWorkPaymentForm";
import InterimReportForm from "@/components/forms/InterimReportForm";

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

  render = () => (
    <Tabs type="card" className="ant-tabs-center">
      <TabPane tab="Interim Payment" key="0">
        <InterimContractedWorkPaymentForm
          paymentType="interim"
          onSubmit={this.handleSubmitInterimContractedWorkPayment}
          closeModal={this.props.closeModal}
          contractedWorkPayment={this.props.contractedWorkPayment}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
        />
      </TabPane>
      <TabPane tab="Interim Progress Report" key="1">
        <InterimReportForm
          onSubmit={this.handleSubmitInterimContractedWorkPaymentProgressReport}
          closeModal={this.props.closeModal}
          contractedWorkPayment={this.props.contractedWorkPayment}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
        />
      </TabPane>
      <TabPane tab="Final Payment" key="2">
        <FinalContractedWorkPaymentForm
          paymentType="final"
          onSubmit={this.handleSubmitFinalContractedWorkPayment}
          closeModal={this.props.closeModal}
          contractedWorkPayment={this.props.contractedWorkPayment}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
        />
      </TabPane>
    </Tabs>
  );
}

ContractedWorkPaymentModal.propTypes = propTypes;

export default ContractedWorkPaymentModal;
