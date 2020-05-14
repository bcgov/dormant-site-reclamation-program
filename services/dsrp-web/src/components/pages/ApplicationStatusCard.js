import React from "react";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { formatDateTime } from "@/utils/helpers";
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
      <Paragraph>Identifier: {props.application.guid}</Paragraph>
      <Paragraph>Status: {props.application.application_status_code}</Paragraph>
      <Paragraph>Submission Date: {formatDateTime(props.application.submission_date)}</Paragraph>
    </Col>
  </Row>
);

ApplicationStatusCard.propTypes = propTypes;

export default ApplicationStatusCard;
