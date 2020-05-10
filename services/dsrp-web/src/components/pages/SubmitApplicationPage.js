import React from "react";
import { Row, Col, Typography } from "antd";

const { Paragraph, Title } = Typography;

export const SubmitApplicationPage = () => (
  <div>
    <Row type="flex" justify="center" align="top" gutter={[{ sm: 0, xl: 64 }]}>
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Submit Application</Title>
        <Paragraph>...</Paragraph>
      </Col>
    </Row>
  </div>
);

export default SubmitApplicationPage;