import React, { Component } from "react";
import { Row, Col, Typography } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import ApplicationForm from "@/components/forms/ApplicationForm";

const { Title, Paragraph } = Typography;

export class SubmitApplicationPage extends Component {
  render() {
    return (
      <>
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>Submit Application</Title>
            <Paragraph>
              Enter your business name, BC address and contact information for this application. The
              contact information provided will be used for all communication regarding this
              application.
            </Paragraph>
          </Col>
        </Row>
        <Row type="flex" justify="center" align="top" className="landing-section">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ApplicationForm />
          </Col>
        </Row>
      </>
    );
  }
}

// TODO: WHEN LAUNCH - REMOVE AuthorizationGuard()
export default AuthorizationGuard()(SubmitApplicationPage);
