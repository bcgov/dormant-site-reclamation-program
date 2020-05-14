import React from "react";
import { Row, Col } from "antd";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const ViewOnlyApplicationForm = (props) => (
  <Row
    gutter={[{ sm: 0, xl: 64 }]}
    type="flex"
    justify="center"
    align="top"
    className="landing-section"
  >
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <ApplicationSectionOne isEditable={false} initialValues={props.initialValues} />
      <ApplicationSectionTwo isEditable={false} initialValues={props.initialValues} />
      <ApplicationSectionThree isEditable={false} initialValues={props.initialValues} />
    </Col>
  </Row>
);

export default ViewOnlyApplicationForm;
