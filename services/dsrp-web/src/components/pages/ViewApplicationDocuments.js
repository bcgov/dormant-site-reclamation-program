import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { document } from "@/customPropTypes/documents";
import { DocumentTable } from "@/components/common/DocumentTable";
import { downloadGeneratedApplicationLetter } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";


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
    <LinkButton
              title='Download Shared Cost Agreement Letter'
              onClick={() =>
                downloadGeneratedApplicationLetter(
                  props.application_guid,
                )
              }
    >
      Download Shared Cost Agreement Letter
    </LinkButton>
    <DocumentTable {...props} />
  </>
);

ViewApplicationDocuments.propTypes = propTypes;

export default ViewApplicationDocuments;
