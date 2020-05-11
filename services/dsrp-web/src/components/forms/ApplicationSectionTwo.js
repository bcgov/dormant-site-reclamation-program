import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { Form } from "antd";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionTwo extends Component {
  render() {
    return (
      <FormSection name="two">
        <Form.Item>
          <Field
            id="permit_no"
            name="permit_no"
            label="Permit number*"
            component={renderConfig.FIELD}
            validate={[required, maxLength(9)]}
          />
        </Form.Item>
      </FormSection>
    );
  }
}

ApplicationSectionTwo.defaultProps = defaultProps;

export default ApplicationSectionTwo;
