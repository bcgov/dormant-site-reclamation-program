import React from "react";
import { Row, Col, Typography } from "antd";

const { Paragraph, Title } = Typography;

export const ReviewApplicationsPage = () => (
  <div>
    <Row type="flex" justify="center" align="top" gutter={[{ sm: 0, xl: 64 }]}>
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Review Applications</Title>
        <Paragraph>...</Paragraph>
      </Col>
    </Row>
  </div>
);

export default ReviewApplicationsPage;
