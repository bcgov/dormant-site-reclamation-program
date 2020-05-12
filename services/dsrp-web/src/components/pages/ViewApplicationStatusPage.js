import React from "react";
import { Row, Col, Typography } from "antd";

const { Paragraph, Title } = Typography;

export const ViewApplicationStatusPage = () => (
  <>
    <Row
      type="flex"
      justify="center"
      align="top"
      className="landing-header"
      gutter={[{ sm: 0, xl: 64 }]}
    >
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>View Application Status</Title>
        <Paragraph>
          Morbi dignissim eget elit ac ornare. Aliquam rhoncus condimentum condimentum. Aenean sed
          diam non elit rutrum sollicitudin. Sed non leo odio.
        </Paragraph>
      </Col>
    </Row>
    <Row
      gutter={[{ sm: 0, xl: 64 }]}
      type="flex"
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Paragraph>Content</Paragraph>
      </Col>
    </Row>
  </>
);

export default ViewApplicationStatusPage;
