import React from "react";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";

const { Paragraph, Title } = Typography;

const propTypes = {
  application: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    json: PropTypes.any,
  }).isRequired,
};

export const ApplicationStatusCard = (props) => (
  <Row>
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <Paragraph>{props.application.guid}</Paragraph>
      <Paragraph>{props.application.application_status_code}</Paragraph>
    </Col>
  </Row>
);

ApplicationStatusCard.propTypes = propTypes;

export default ApplicationStatusCard;
