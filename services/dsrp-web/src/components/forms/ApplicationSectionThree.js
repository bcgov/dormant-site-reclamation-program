import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import PropTypes from "prop-types";
import { Row, Col, Form, Button } from "antd";
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

class ApplicationSectionThree extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="review">
          <Field
            id="reviewed_and_verified"
            name="reviewed_and_verified"
            label="I have reviewed and verified that this application's information is correct."
            component={renderConfig.CHECKBOX}
            validate={[required]}
            disabled={!this.props.isEditable}
          />
        </FormSection>

        <ViewOnlyApplicationForm
          isEditable={false}
          initialValues={this.props.values}
          noRenderStep3
        />

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
