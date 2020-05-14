import React from "react";
import { Row, Col } from "antd";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const ViewOnlyApplicationForm = (props) => (
  <Row>
    <Col className="steps-content">
      <ApplicationSectionOne isEditable={false} initialValues={props.initialValues} />
      <ApplicationSectionTwo isEditable={false} initialValues={props.initialValues} />
      <ApplicationSectionThree isEditable={false} initialValues={props.initialValues} />
    </Col>
  </Row>
);

export default ViewOnlyApplicationForm;
