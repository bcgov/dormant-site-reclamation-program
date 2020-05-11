import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { Form } from "antd";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionThree extends Component {
  render() {
    return (
      <FormSection name="three">
        <Form.Item>
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue date*"
            component={renderConfig.DATE}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>
      </FormSection>
    );
  }
}

ApplicationSectionThree.defaultProps = defaultProps;

export default ApplicationSectionThree;
