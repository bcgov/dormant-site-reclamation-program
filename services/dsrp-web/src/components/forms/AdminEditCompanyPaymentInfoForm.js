import React, { Component } from "react";
import { isPristine, reduxForm, Field, getFormValues } from "redux-form";
import { Row, Col, Form, Button, Popconfirm } from "antd";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  companyPaymentInfo: PropTypes.any.isRequired,
  isAdd: PropTypes.any.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  isPristine: PropTypes.bool.isRequired,
};

export class AdminEditCompanyPaymentInfoForm extends Component {
  componentDidUpdate = () => {
    if (!this.props.isPristine) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  };

  render() {
    const companyPaymentInfo = this.props.companyPaymentInfo || {};

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col span={24}>
            <Field
              id="company_name"
              name="company_name"
              label="Company Name"
              disabled={!this.props.isAdd}
              component={renderConfig.FIELD}
            />
            <Field
              id="company_address"
              name="company_address"
              label="Company Address"
              component={renderConfig.FIELD}
            />
            <Field
              id="po_number"
              name="po_number"
              label="PO Number"
              component={renderConfig.FIELD}
            />
            <Field
              id="po_number_2"
              name="po_number_2"
              label="PO Number 2"
              component={renderConfig.FIELD}
            />
            <Field
              id="qualified_receiver_name"
              name="qualified_receiver_name"
              label="Qualified Receiver Name"
              component={renderConfig.FIELD}
            />
            <Field
              id="expense_authority_name"
              name="expense_authority_name"
              label="Expense Authority Name"
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
              Submit
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
