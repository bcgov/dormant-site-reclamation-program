import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { document } from "@/customPropTypes/documents";
import { DocumentTable } from "@/components/common/DocumentTable";
import { downloadGeneratedApplicationLetter } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";

const { Title } = Typography;

const propTypes = {
  application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(document).isRequired,
};

export const ViewApplicationDocuments = (props) => (
  <>
    <Title level={3} className="documents-section">
      Documents
    </Title>
    <LinkButton
      title="shared_cost_agreement"
      onClick={() => downloadGeneratedApplicationLetter(props.application_guid)}
    >
      Shared Cost Agreement Letter Draft
    </LinkButton>
    <DocumentTable application_guid={props.application_guid} documents={props.documents} />
  </>
);

ViewApplicationDocuments.propTypes = propTypes;

export default ViewApplicationDocuments;
