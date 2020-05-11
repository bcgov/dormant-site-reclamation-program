import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionThree extends Component {
  render() {
    return (
      <FormSection name="three">
        <Field
          id="date"
          name="date"
          label="Date"
          placeholder="Select date"
          component={renderConfig.DATE}
          validate={[required, dateNotInFuture]}
        />
      </FormSection>
    );
  }
}

ApplicationSectionThree.defaultProps = defaultProps;

export default ApplicationSectionThree;
