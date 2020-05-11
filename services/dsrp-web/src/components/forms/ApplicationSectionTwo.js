import React, { Component } from "react";
import { Field, FormSection } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";

const defaultProps = {};

class ApplicationSectionTwo extends Component {
  render() {
    return (
      <FormSection name="two">
        <Field
          id="random_stuff"
          name="random_stuff"
          label="Random Stuff"
          placeholder="Enter random stuff"
          component={renderConfig.FIELD}
          validate={[required, maxLength(9)]}
        />
      </FormSection>
    );
  }
}

ApplicationSectionTwo.defaultProps = defaultProps;

export default ApplicationSectionTwo;
