import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { document } from "@/customPropTypes/documents";
import { DocumentTable } from "@/components/common/DocumentTable";

const { Title, Text } = Typography;
const propTypes = {
  application_guid: PropTypes.string,
  documents: PropTypes.arrayOf(document).isRequired,
};

export const ViewApplicationDocuments = (props) => (
  <>
    <Title level={3} className="documents-section">
      Documents
    </Title>
    <DocumentTable {...props} />
  </>
);

ViewApplicationDocuments.propTypes = propTypes;

export default ViewApplicationDocuments;
