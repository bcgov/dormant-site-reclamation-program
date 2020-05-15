import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import PropTypes from "prop-types";
import { Row, Col, Form, Button, Typography } from "antd";
import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  extraActions: PropTypes.node,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  extraActions: undefined,
  isEditable: true,
};

const { Paragraph, Text, Title } = Typography;

class ApplicationSectionThree extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        {this.props.isEditable && (
          <>
            <Title level={3}>Review Application</Title>
            <Paragraph>
              Please review your application below and confirm that its information is correct.
            </Paragraph>
            <Row gutter={48}>
              <Col>
                <ViewOnlyApplicationForm
                  isEditable={false}
                  initialValues={this.props.values}
                  noRenderStep3
                />
              </Col>
            </Row>
          </>
        )}

        <FormSection name="review">
          <Title level={3}>Confirm and Submit</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Field
                id="reviewed_and_verified"
                name="reviewed_and_verified"
                label="I have reviewed and verified that this application's information is correct."
                component={renderConfig.CHECKBOX}
                validate={[required]}
                disabled={!this.props.isEditable}
              />
            </Col>
          </Row>
        </FormSection>

        {this.props.isEditable && (
          <Row className="steps-action">
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                disabled={this.props.submitting || this.props.invalid}
              >
                Submit
              </Button>
              <Button style={{ margin: "0 8px" }} onClick={this.props.previousStep}>
                Previous
              </Button>
              {this.props.extraActions}
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}

ApplicationSectionThree.propTypes = propTypes;
ApplicationSectionThree.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  keepDirtyOnReinitialize: true,
  enableReinitialize: true,
  updateUnregisteredFields: true,
})(ApplicationSectionThree);
