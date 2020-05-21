import React from "react";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { document } from "@/customPropTypes/documents";
import { DocumentTable } from "@/components/common/DocumentTable";
const propTypes = {
  application_guid: PropTypes.string,
  documents: PropTypes.arrayOf(document).isRequired,
};

export const ViewApplicationDocuments = (props) => (
  <Row type="flex" justify="center" align="top" className="landing-header">
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <Typography.Title level={3} className="documents-section">
        Documents
      </Typography.Title>
      <DocumentTable {...props} />
    </Col>
  </Row>
);

ViewApplicationDocuments.propTypes = propTypes;

export default ViewApplicationDocuments;
