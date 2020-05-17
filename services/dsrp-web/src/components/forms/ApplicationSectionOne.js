import React, { Component } from "react";
import { reduxForm, Field, FormSection, formValueSelector } from "redux-form";
import { Row, Col, Typography, Form, Button } from "antd";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { renderConfig } from "@/components/common/config";
import { required, email, maxLength } from "@/utils/validate";
import { phoneMask, postalCodeMask } from "@/utils/helpers";
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
          <Title level={2}>Company Details</Title>
          <Row gutter={48}>
            <Col span={24}>
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
                id="indigenous_participation_ind"
                name="indigenous_participation_ind"
                label="Do you wish to self‑identify as including Indigenous participation in completing the work outlined within this application?"
                disabled={!this.props.isEditable}
                component={renderConfig.CHECKBOX}
                disabled={!this.props.isEditable}
              />
              {this.props.indigenousParticipationCheckbox && (
                <Field
                  id="indigenous_participation_description"
                  name="indigenous_participation_description"
                  label="If so, please describe:"
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
                placeholder="Address Line 2 (Optional)"
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
                validate={[required]}
                {...postalCodeMask}
              />
            </Col>
          </Row>
        </FormSection>

        <FormSection name="company_contact">
          <Title level={2}>Company Contact</Title>
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
                    validate={[required]}
                    {...phoneMask}
                  />
                </Col>
                <Col sm={24} md={10}>
                  <Field
                    id="phone_ext_1"
                    name="phone_ext_1"
                    label="Ext. 1 (Optional)"
                    placeholder="Ext. 1  (Optional)"
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
                    placeholder="Phone Number 2 (Optional)"
                    component={renderConfig.FIELD}
                    disabled={!this.props.isEditable}
                    {...phoneMask}
                  />
                </Col>
                <Col sm={24} md={10}>
                  <Field
                    id="phone_ext_2"
                    name="phone_ext_2"
                    label="Ext. 2 (Optional)"
                    placeholder="Ext. 2 (Optional)"
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
            </Col>
            <Col xs={24} sm={12}>
              <Field
                id="fax"
                name="fax"
                label="Fax (Optional)"
                placeholder="Fax (Optional)"
                component={renderConfig.FIELD}
                disabled={!this.props.isEditable}
                {...phoneMask}
              />
            </Col>
          </Row>
        </FormSection>

        {this.props.isEditable && (
          <>
            <FormSection name="review_program_conditions">
              <Title level={2}>Review Program Requirements</Title>
              <Row gutter={48}>
                <Col span={24}>
                  <Paragraph>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Review program details and requirements
                    </a>
                  </Paragraph>
                  <Field
                    id="accept_program_details_and_requirements"
                    name="accept_program_details_and_requirements"
                    label="I have read and understand all of the conditions required to qualify for this program."
                    component={renderConfig.CHECKBOX}
                    validate={[required]}
                  />
                </Col>
              </Row>
            </FormSection>

            <Row className="steps-action">
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={this.props.submitting || this.props.invalid}
                >
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
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
  })
)(ApplicationSectionOne);
