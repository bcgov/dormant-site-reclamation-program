import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Divider } from "antd";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { required, number, requiredList } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import { currencyMask } from "@/utils/helpers";
import { EXCEL } from "@/constants/fileTypes";
import { EOC_TEMPLATE } from "@/constants/assets";

const { Title, Text } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

class InterimContractedWorkPaymentForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>Interim Payment Information</Title>

        <Text>
          In ligula purus, dapibus rhoncus sollicitudin non, venenatis ac orci. Nulla molestie dolor
          nec euismod tempor. Pellentesque in leo et metus ullamcorper consectetur.
        </Text>

        <br />
        <br />

        <Row gutter={48}>
          <Col>
            <Field
              id="interim_total_hours_worked_to_date"
              name="interim_total_hours_worked_to_date"
              label="Total Number of Hours Worked"
              placeholder="0"
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id="interim_number_of_workers"
              name="interim_number_of_workers"
              label="Total Number of Workers"
              placeholder="0"
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id="interim_actual_cost"
              name="interim_actual_cost"
              label="Evidence of Cost Invoice Amount Total"
              placeholder="$0.00"
              component={renderConfig.FIELD}
              validate={[required, number]}
              {...currencyMask}
            />
            <Field
              id="interim_eoc"
              name="interim_eoc"
              label={
                <>
                  <div>Evidence of Cost</div>
                  Please&nbsp;
                  <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                    download
                  </a>
                  &nbsp;and use the provided Evidence of Cost template.
                </>
              }
              component={renderConfig.FILE_UPLOAD}
              validate={[requiredList]}
              labelIdle="Upload Evidence of Cost"
              acceptedFileTypesMap={{ ...EXCEL }}
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
              allowMultiple={false}
              allowRevert
            />
            <Field
              id="interim_submission_confirmation"
              name="interim_submission_confirmation"
              label="I certify that the provided information is true and correct."
              component={renderConfig.CHECKBOX}
              validate={[required]}
            />
          </Col>
        </Row>
        <div className="right">
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
        </div>
      </Form>
    );
  }
}

InterimContractedWorkPaymentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.INTERIM_CONTRACTED_WORK_PAYMENT_FORM,
})(InterimContractedWorkPaymentForm);
