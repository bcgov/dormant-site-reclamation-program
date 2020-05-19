import React from "react";
import { Row, Col, Typography, Icon } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import ReviewApplicationInfo from "@/components/admin/ReviewApplicationInfo";

const { Paragraph, Title } = Typography;

export const ReviewApplicationsPage = () => (
  <>
    <Row type="flex" justify="center" align="top" className="landing-header">
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Review Applications</Title>
        <Paragraph>
          This table shows all of the applications received for the program. To review the
          individual work components, click <Icon type="plus-square" /> next to the Well
          Authorization Number. Click <Icon type="eye" /> to open the original application or view
          the documents related to the application.
        </Paragraph>
      </Col>
    </Row>
    <Row type="flex" justify="center" align="top" className="landing-section">
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <ReviewApplicationInfo />
      </Col>
    </Row>
  </>
);

export default AuthorizationGuard()(ReviewApplicationsPage);
