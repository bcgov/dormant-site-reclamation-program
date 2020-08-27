import React, { Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import InterimContractedWorkPaymentForm from "@/components/forms/InterimContractedWorkPaymentForm";
import FinalContractedWorkPaymentForm from "@/components/forms/FinalContractedWorkPaymentForm";
import InterimReportForm from "@/components/forms/InterimReportForm";
import CustomPropTypes from "@/customPropTypes";

const { TabPane } = Tabs;

const propTypes = {
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
  applicationSummary: CustomPropTypes.applicationSummary.isRequired,
  isAdminView: PropTypes.bool,
};

const defaultProps = {
  isAdminView: false,
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
          applicationSummary={this.props.applicationSummary}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
          isAdminView={this.props.isAdminView}
        />
      </TabPane>
      <TabPane tab="Interim Progress Report" key="1">
        <InterimReportForm
          onSubmit={this.handleSubmitInterimContractedWorkPaymentProgressReport}
          closeModal={this.props.closeModal}
          contractedWorkPayment={this.props.contractedWorkPayment}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
          isAdminView={this.props.isAdminView}
        />
      </TabPane>
      <TabPane tab="Final Payment" key="2">
        <FinalContractedWorkPaymentForm
          paymentType="final"
          onSubmit={this.handleSubmitFinalContractedWorkPayment}
          closeModal={this.props.closeModal}
          contractedWorkPayment={this.props.contractedWorkPayment}
          applicationSummary={this.props.applicationSummary}
          initialValues={this.props.contractedWorkPayment.contracted_work_payment}
          isAdminView={this.props.isAdminView}
        />
      </TabPane>
    </Tabs>
  );
}

ContractedWorkPaymentModal.propTypes = propTypes;
ContractedWorkPaymentModal.defaultProps = defaultProps;

export default ContractedWorkPaymentModal;
