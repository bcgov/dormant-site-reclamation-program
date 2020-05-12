import React from "react";
import { Result, Row, Col, Typography, Icon } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text } = Typography;

const NotFoundNotice = () => (
  <Row>
    <Col>
      <Result
        title="Mine Not Found"
        status="error"
        subTitle={<Text>It appears the mine you are requesting does not exist.</Text>}
        icon={<Icon type="stop" />}
        extra={
          <Paragraph>
            Please contact&nbsp;
            <a href={Strings.HELP_EMAIL}>{Strings.HELP_EMAIL}</a>
            &nbsp;for assistance.
          </Paragraph>
        }
      />
    </Col>
  </Row>
);

export default NotFoundNotice;
