import React, { Component } from "react";
import { isPristine, reduxForm, Field, getFormValues } from "redux-form";
import {
  Row,
  Col,
  Alert,
  Form,
  Button,
  Typography,
  Popconfirm,
  Descriptions,
  Tabs,
  Table,
} from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import { lowerCase, isEmpty, isEqual, capitalize } from "lodash";
import PropTypes from "prop-types";
import { formatMoney, currencyAllowNegativeMask, formatDate } from "@/utils/helpers";
import { required, number, maxLength } from "@/utils/validate";
import { renderConfig } from "@/components/common/config";
import {
  getContractedWorkTypeOptionsHash,
  getContractedWorkPaymentStatusOptionsHash,
  getDropdownContractedWorkPaymentStatusOptions,
} from "@/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import { toolTip } from "@/components/admin/ApplicationTable";
import { CONTRACTED_WORK_PAYMENT_STATUS } from "@/constants/payments";
import * as Payment from "@/utils/paymentHelper";

const { Text, Title } = Typography;

const { TabPane } = Tabs;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  companyPaymentInfo: PropTypes.any.isRequired,
  isAdd: PropTypes.any.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  isPristine: PropTypes.bool.isRequired,
};

const defaultProps = {
  formValues: null,
};

export class AdminEditCompanyPaymentInfoForm extends Component {

  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps.formValues, this.props.formValues) ||
    !isEqual(nextState, this.state) ||
    nextProps.submitting !== this.props.submitting;

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues && !isEqual(nextProps.formValues, this.props.formValues)) {
      this.setState({

      });
    }
  };

  componentDidMount() {
    const data = this.getSavedFormData();
    if (data) {
      this.setState({
        initialValues: data.formValues,
        saveTimestamp: data.saveTimestamp,
      });
    }
    this.autoSaveForm = setInterval(() => this.saveFormData(), 10000);
  }

  getSavedFormData() {
    const data = localStorage.getItem(FORM.ADMIN_EDIT_COMPANY_PAYMENT_INFO_FORM);
    return data ? JSON.parse(data) : null;
  }

  componentDidUpdate = () => {
    if (!this.props.isPristine) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  }

  saveFormData() {
    if (this.props.isPristine) {
      return;
    }

    const data = {
      formValues: this.props.formValues,
      saveTimestamp: new Date().getTime(),
    };

    localStorage.setItem(FORM.ADMIN_EDIT_COMPANY_PAYMENT_INFO_FORM, JSON.stringify(data));

    this.setState({
      saveTimestamp: data.saveTimestamp,
      previouslySavedFormValues: data.formValues,
    });
  }

  handleTabChange = (activeKey) => this.setState({ currentActiveTab: activeKey });

  render() {
    const companyPaymentInfo = this.props.companyPaymentInfo || {};
    const companyPaymentInfoExists = !isEmpty(companyPaymentInfo);

    const handleSubmit = this.props.handleSubmit((values) =>
      this.props.onSubmit(this.state.currentActiveTab, {
        contracted_work_payment_code: this.state.currentActiveTab,
        ...values,
      })
    );

    return (
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Row gutter={48}>
          <Col span={24}>
            <Field
              id="company_name"
              name="company_name"
              label="Name of the company the payment information relates to"
              disabled={!this.props.isAdd}
              component={renderConfig.FIELD}
            />
            <Field
              id="company_address"
              name="company_address"
              label="Address of the company"
              component={renderConfig.FIELD}
            />
            <Field
              id="po_number"
              name="po_number"
              label="PO number of the company"
              component={renderConfig.FIELD}
            />
            <Field
              id="qualified_receiver_name"
              name="qualified_receiver_name"
              label="Qualified receiver name for the company"
              component={renderConfig.FIELD}
            />
            <Field
              id="expense_authority_name"
              name="expense_authority_name"
              label="Expense Authority name for the company"
              component={renderConfig.FIELD}
            />
          </Col>
        </Row>

        <div className="right">
            <>
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={this.props.closeModal}
                okText="Yes"
                cancelText="No"
                disabled={this.props.submitting}
              >
                <Button type="secondary" disabled={this.props.submitting}>
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 5 }}
                loading={this.props.submitting}
              >
                Submit Changes
              </Button>
            </>
        </div>
      </Form>
    );
  }
}

AdminEditCompanyPaymentInfoForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADMIN_EDIT_COMPANY_PAYMENT_INFO_FORM)(state),
  isPristine: isPristine(FORM.ADMIN_EDIT_COMPANY_PAYMENT_INFO_FORM)(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.ADMIN_EDIT_COMPANY_PAYMENT_INFO_FORM,
    enableReinitialize: true,
  })
)(AdminEditCompanyPaymentInfoForm);
