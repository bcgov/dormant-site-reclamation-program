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
              Duis dictum quam vel dictum sollicitudin. Suspendisse potenti. Mauris convallis eget
              urna vitae dapibus. Etiam volutpat, metus aliquam sollicitudin aliquet, diam dui
              lacinia odio, id tempor purus libero ut orci.
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
