import React, { Component } from "react";
import { reduxForm } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import { phoneMask, postalCodeMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";

const { Text, Title } = Typography;

const defaultProps = {};

class ApplicationSectionOne extends Component {
  state = {
    uploadedFiles: [],
    filesToDelete: [],
  };

  onFileLoad = (document_name, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [{ document_manager_guid, document_name }, ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter(
        (doc) => doc.document_manager_guid !== file.serverId
      ),
    }));
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="company_details">
          <Title level={2}>Company Details</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Field
                id="company_name"
                name="company_name"
                label="Company Name"
                placeholder="Company Name"
                component={renderConfig.FIELD}
                validate={[required]}
              />
              <Field
                id="address_line_1"
                name="address_line_1"
                label="Address Line 1"
                placeholder="Address Line 1"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
              <Field
                id="address_line_2"
                name="address_line_2"
                label="Address Line 2"
                placeholder="Address Line 2"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
              <Field
                id="city"
                name="city"
                label="City"
                placeholder="City"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={12}>
              <Field
                id="province"
                name="province"
                label="Province"
                placeholder="Province"
                component={renderConfig.SELECT}
                //validate={[required]}
                data={[
                  { value: "AB", label: "Alberta" },
                  { value: "BC", label: "British Columbia" },
                  { value: "MB", label: "Manitoba" },
                  { value: "NB", label: "New Brunswick" },
                  { value: "NL", label: "Newfoundland and Labrador" },
                  { value: "NS", label: "Nova Scotia" },
                  { value: "ON", label: "Ontario" },
                  { value: "PE", label: "Prince Edward Island" },
                  { value: "QC", label: "Quebec" },
                  { value: "SK", label: "Saskatchewan" },
                  { value: "NT", label: "Northwest Territories" },
                  { value: "NU", label: "Nunavut" },
                  { value: "YT", label: "Yukon" },
                ]}
              />
            </Col>
            <Col span={12}>
              <Field
                id="postal_code"
                name="postal_code"
                label="Postal Code"
                placeholder="Postal Code"
                component={renderConfig.FIELD}
                //validate={[required]}
                {...postalCodeMask}
              />
            </Col>
          </Row>
        </FormSection>

        <FormSection name="company_contact">
          <Title level={2}>Company Contact</Title>
          <Row gutter={48}>
            <Col span={12}>
              <Field
                id="first_name"
                name="first_name"
                label="First Name"
                placeholder="First Name"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
            </Col>
            <Col span={12}>
              <Field
                id="last_name"
                name="last_name"
                label="Last Name"
                placeholder="Last Name"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={12}>
              <Row gutter={48}>
                <Col span={16}>
                  <Field
                    id="phone_number_1"
                    name="phone_number_1"
                    label="Phone Number 1"
                    placeholder="Phone Number 1"
                    component={renderConfig.FIELD}
                    //validate={[required]}
                    {...phoneMask}
                  />
                </Col>
                <Col span={8}>
                  <Field
                    id="phone_ext_1"
                    name="phone_ext_1"
                    label="Ext. 1"
                    placeholder="Ext. 1"
                    component={renderConfig.FIELD}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={48}>
                <Col span={16}>
                  <Field
                    id="phone_number_2"
                    name="phone_number_2"
                    label="Phone Number 2"
                    placeholder="Phone Number 2"
                    component={renderConfig.FIELD}
                    {...phoneMask}
                  />
                </Col>
                <Col span={8}>
                  <Field
                    id="phone_ext_2"
                    name="phone_ext_2"
                    label="Ext. 2"
                    placeholder="Ext. 2"
                    component={renderConfig.FIELD}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col span={12}>
              <Field
                id="email"
                name="email"
                label="Email"
                placeholder="Email"
                component={renderConfig.FIELD}
                //validate={[required]}
              />
            </Col>
          </Row>
        </FormSection>

        <FormSection name="ducks">
          <Title level={2}>Good Pics of Ducks</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Form.Item label="Upload Pics of Ducks">
                <Field
                  id="ducks"
                  name="ducks"
                  component={renderConfig.FILE_UPLOAD}
                  //   placeholder="how do i change this message"
                  //   uploadUrl={DUCK_DOCUMENTS(this.props.ducks)}
                  //   acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
                  onFileLoad={this.onFileLoad}
                  onRemoveFile={this.onRemoveFile}
                  allowRevert
                  allowMultiple={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        <Row className="steps-action">
          <Col>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ApplicationSectionOne.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(ApplicationSectionOne);
