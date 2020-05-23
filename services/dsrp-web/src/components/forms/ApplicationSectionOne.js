import React, { Component } from "react";
import { reduxForm, Field, FormSection, formValueSelector } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { renderConfig } from "@/components/common/config";
import { required, email, maxLength, postalCode, exactLength } from "@/utils/validate";
import { phoneMask, postalCodeMask, businessNumberMask, scrollToFirstError } from "@/utils/helpers";
import * as FORM from "@/constants/forms";
import OrgBookSearch from "@/components/common/OrgBookSearch";
import ApplicationFormTooltip from "@/components/common/ApplicationFormTooltip";
import ApplicationFormReset from "@/components/forms/ApplicationFormReset";
import { ORGBOOK_URL } from "@/constants/routes";

const { Title, Paragraph } = Typography;

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  indigenousParticipationCheckbox: PropTypes.bool.isRequired,
  isViewingSubmission: PropTypes.bool,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  isViewingSubmission: false,
  isEditable: true,
};

const validate = (values) => {
  const errors = {};
  if (values.company_contact && values.company_contact.email !== values.company_contact.email2) {
    errors.company_contact = { email2: "Email does not match" };
  }
  return errors;
};

class ApplicationSectionOne extends Component {
  handleReset = () => {
    this.props.initialize();
    this.props.handleReset();
  };

  componentWillUnmount() {
    if (this.props.isViewingSubmission) {
      this.props.reset();
    }
  }

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <FormSection name="company_details">
          <Title level={3} className="application-section">
            Company Details
          </Title>
          <Row gutter={48}>
            <Col>
              <Field
                id="company_name"
                name="company_name"
                label={
                  <>
                    Company Name
                    {this.props.isEditable && (
                      <>
                        <ApplicationFormTooltip
                          content={
                            <>
                              Enter your business name as recorded with BC Registries. Your company
                              must be registered with BC Registries to qualify.&nbsp;
                              <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="color-white"
                              >
                                Register now
                              </a>
                            </>
                          }
                        />
                        <a
                          style={{ float: "right" }}
                          href={ORGBOOK_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Search BC Registries for your company
                        </a>
                      </>
                    )}
                  </>
                }
                placeholder="Company Name"
                component={OrgBookSearch}
                validate={[required]}
                disabled={!this.props.isEditable}
                format={null}
              />
              <Field
                id="business_number"
                name="business_number"
                label="Business Number"
                placeholder="Business Number"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, exactLength(9)]}
                {...businessNumberMask}
              />
              <Field
                id="indigenous_participation_ind"
                name="indigenous_participation_ind"
                label="My proposal, as outlined in this application, includes Indigenous participation in completing the work."
                disabled={!this.props.isEditable}
                component={renderConfig.CHECKBOX}
              />
              {this.props.indigenousParticipationCheckbox && (
                <Field
                  id="indigenous_participation_description"
                  name="indigenous_participation_description"
                  label="Please describe: (Do not include any personal information)"
                  component={renderConfig.AUTO_SIZE_FIELD}
                  validate={[required, maxLength(65536)]}
                  disabled={!this.props.isEditable}
                />
              )}
              <Field
                id="address_line_1"
                name="address_line_1"
                label="Address Line 1"
                placeholder="Address Line 1"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, maxLength(1024)]}
              />
              <Field
                id="address_line_2"
                name="address_line_2"
                label="Address Line 2 (Optional)"
                placeholder={this.props.isEditable ? "Address Line 2 (Optional)" : ""}
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[maxLength(1024)]}
              />
              <Field
                id="city"
                name="city"
                label="City"
                placeholder="City"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, maxLength(1024)]}
              />
            </Col>
          </Row>
          <Row gutter={48}>
            <Col xs={24} sm={12}>
              <Field
                id="province"
                name="province"
                label="Province"
                placeholder="Province"
                component={renderConfig.SELECT}
                disabled={!this.props.isEditable}
                validate={[required]}
                format={null}
                data={[{ value: "BC", label: "British Columbia" }]}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Field
                id="postal_code"
                name="postal_code"
                label="Postal Code"
                placeholder="Postal Code"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, postalCode]}
                {...postalCodeMask}
              />
            </Col>
          </Row>
        </FormSection>

        <FormSection name="company_contact">
          <Title level={3} className="application-section">
            Company Contact
          </Title>
          <Row gutter={48}>
            <Col xs={24} sm={12}>
              <Field
                id="first_name"
                name="first_name"
                label="First Name"
                placeholder="First Name"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, maxLength(1024)]}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Field
                id="last_name"
                name="last_name"
                label="Last Name"
                placeholder="Last Name"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, maxLength(1024)]}
              />
            </Col>
          </Row>
          <Row gutter={48}>
            <Col sm={24} md={12}>
              <Row gutter={48}>
                <Col sm={24} md={14}>
                  <Field
                    id="phone_number_1"
                    name="phone_number_1"
                    label="Phone Number 1"
                    placeholder="Phone Number 1"
                    component={renderConfig.FIELD}
                    disabled={!this.props.isEditable}
                    validate={[required, exactLength(10)]}
                    {...phoneMask}
                  />
                </Col>
                <Col sm={24} md={10}>
                  <Field
                    id="phone_ext_1"
                    name="phone_ext_1"
                    label="Ext. 1 (Optional)"
                    placeholder={this.props.isEditable ? "Ext. 1  (Optional)" : ""}
                    component={renderConfig.FIELD}
                    disabled={!this.props.isEditable}
                    validate={[maxLength(6)]}
                  />
                </Col>
              </Row>
            </Col>
            <Col sm={24} md={12}>
              <Row gutter={48}>
                <Col sm={24} md={14}>
                  <Field
                    id="phone_number_2"
                    name="phone_number_2"
                    label="Phone Number 2 (Optional)"
                    placeholder={this.props.isEditable ? "Phone Number 2 (Optional)" : ""}
                    component={renderConfig.FIELD}
                    disabled={!this.props.isEditable}
                    validate={[exactLength(10)]}
                    {...phoneMask}
                  />
                </Col>
                <Col sm={24} md={10}>
                  <Field
                    id="phone_ext_2"
                    name="phone_ext_2"
                    label="Ext. 2 (Optional)"
                    placeholder={this.props.isEditable ? "Ext. 2 (Optional)" : ""}
                    component={renderConfig.FIELD}
                    disabled={!this.props.isEditable}
                    validate={[maxLength(6)]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={48}>
            <Col xs={24} sm={12}>
              <Field
                id="email"
                name="email"
                label="Email"
                placeholder="Email"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, email, maxLength(1024)]}
              />
              <Field
                id="email2"
                name="email2"
                label="Confirm Email"
                placeholder="Confirm Email"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[required, email, maxLength(1024)]}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Field
                id="fax"
                name="fax"
                label="Fax (Optional)"
                placeholder={this.props.isEditable ? "Fax (Optional)" : ""}
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                validate={[exactLength(10)]}
                {...phoneMask}
              />
            </Col>
          </Row>
        </FormSection>

        {this.props.isEditable && (
          <>
            <FormSection name="review_program_conditions">
              <Title level={3} className="application-section">
                Review Program Requirements
              </Title>
              <Row gutter={48}>
                <Col>
                  <Paragraph>
                    <title level={3}>TODO: ADD REAL PDF</title>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Review program details and requirements
                    </a>
                  </Paragraph>
                  <Field
                    id="accept_program_details_and_requirements"
                    name="accept_program_details_and_requirements"
                    label={
                      "I understand that in order to receive funding I must agree to the General \
                    Terms and Conditions for the Dormant Sites Reclamation Program, as will be \
                    supplemented by additional terms contained within any offer letter that may \
                    be provided by the Province."
                    }
                    component={renderConfig.CHECKBOX}
                    validate={[required]}
                  />
                </Col>
              </Row>
            </FormSection>

            <Row className="steps-action">
              <Col>
                <Button type="primary" htmlType="submit" disabled={this.props.submitting}>
                  Next
                </Button>
                <ApplicationFormReset onConfirm={this.handleReset} />
              </Col>
            </Row>
          </>
        )}
      </Form>
    );
  }
}

const selector = formValueSelector(FORM.APPLICATION_FORM);

const mapStateToProps = (state) => ({
  indigenousParticipationCheckbox: selector(state, "company_details.indigenous_participation_ind"),
});

const mapDispatchToProps = () => ({});

ApplicationSectionOne.propTypes = propTypes;
ApplicationSectionOne.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.APPLICATION_FORM,
    validate,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
    onSubmitFail: (errors) => scrollToFirstError(errors),
  })
)(ApplicationSectionOne);
