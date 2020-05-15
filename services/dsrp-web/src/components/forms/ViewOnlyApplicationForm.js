import React from "react";
import { Row, Col } from "antd";
import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  noRenderStep3: PropTypes.bool,
};

const defaultProps = {
  noRenderStep3: false,
};

const ViewOnlyApplicationForm = (props) => (
  <Row>
    <Col className="steps-content">
      <ApplicationSectionOne isEditable={false} initialValues={props.initialValues} />
      <ApplicationSectionTwo isEditable={false} initialValues={props.initialValues} />
      {!props.noRenderStep3 && (
        <ApplicationSectionThree isEditable={false} initialValues={props.initialValues} />
      )}
    </Col>
  </Row>
);

ViewOnlyApplicationForm.propTypes = propTypes;
ViewOnlyApplicationForm.defaultProps = defaultProps;

export default ViewOnlyApplicationForm;
