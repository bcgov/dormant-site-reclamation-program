import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionOne extends Component {
  render() {
    return (
      <FormSection name="one">
        <Field
          id="text"
          name="text"
          label="Text"
          placeholder="Enter text"
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </FormSection>
    );
  }
}

ApplicationSectionOne.defaultProps = defaultProps;

export default ApplicationSectionOne;
