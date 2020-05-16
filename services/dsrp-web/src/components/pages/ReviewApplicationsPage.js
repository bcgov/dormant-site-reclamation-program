import React from "react";
import { Row, Col, Typography } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import ReviewApplicationInfo from "@/components/admin/ReviewApplicationInfo";

const { Paragraph, Title } = Typography;

export const ReviewApplicationsPage = () => (
  <>
    <Row type="flex" justify="center" align="top" className="landing-header">
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Review Applications</Title>
        <Paragraph>
          Integer dapibus turpis quis odio bibendum sagittis. Nunc sed vehicula ex. Praesent
          pharetra lectus at dignissim pulvinar. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit.
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
