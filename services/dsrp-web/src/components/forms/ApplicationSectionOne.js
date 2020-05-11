import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { Form } from "antd";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionOne extends Component {
  render() {
    return (
      <FormSection name="one">
        <Form.Item>
          <Field
            id="name"
            name="name"
            label="Name"
            placeholder="Type"
            component={renderConfig.FIELD}
            validate={[required]}
          />
        </Form.Item>
      </FormSection>
    );
  }
}

ApplicationSectionOne.defaultProps = defaultProps;

export default ApplicationSectionOne;
