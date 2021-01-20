import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  application: PropTypes.objectOf(PropTypes.any),
  initialValues: PropTypes.objectOf(PropTypes.any),
  noRenderStep3: PropTypes.bool,
  isViewingSubmission: PropTypes.bool,
  isAdminEditMode: PropTypes.bool,
};

const defaultProps = {
  application: {},
  initialValues: undefined,
  noRenderStep3: false,
  isViewingSubmission: false,
  isAdminEditMode: false,
};

const ViewOnlyApplicationForm = (props) => (
  <React.Fragment>
    <ApplicationSectionOne
      application={props.application}
      isViewingSubmission={props.isViewingSubmission}
      isEditable={false}
      isAdminEditMode={props.isAdminEditMode}
      initialValues={props.initialValues}
    />
    <ApplicationSectionTwo
      application={props.application}
      isViewingSubmission={props.isViewingSubmission}
      isEditable={false}
      isAdminEditMode={props.isAdminEditMode}
      initialValues={props.initialValues}
    />
    {!props.noRenderStep3 && (
      <ApplicationSectionThree
        application={props.application}
        isViewingSubmission={props.isViewingSubmission}
        isEditable={false}
        initialValues={props.initialValues}
      />
    )}
  </React.Fragment>
);

ViewOnlyApplicationForm.propTypes = propTypes;
ViewOnlyApplicationForm.defaultProps = defaultProps;

export default ViewOnlyApplicationForm;
