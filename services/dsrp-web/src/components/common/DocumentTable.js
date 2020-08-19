import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import {
  formatDateTime,
  truncateFilename,
  dateSorter,
  nullableStringOrNumberSorter,
} from "@/utils/helpers";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  applicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  documents: PropTypes.arrayOf(CustomPropTypes.document).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  applicationGuid: PropTypes.string.isRequired,
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "Document Name",
      dataIndex: "document_name",
      sorter: nullableStringOrNumberSorter("document_name"),
      render: (text, record) => {
        return (
          <div title="Document Name">
            <LinkButton
              title={text}
              onClick={() =>
                downloadDocument(
                  props.applicationGuid,
                  record.application_document_guid,
                  record.document_name
                )
              }
            >
              {truncateFilename(text)}
            </LinkButton>
          </div>
        );
      },
    },
    {
      title: "Upload Date",
      dataIndex: "upload_date",
      sorter: dateSorter("upload_date"),
      render: (text) => <div title="Upload Date">{formatDateTime(text)}</div>,
    },
    {
      title: "Document Type",
      dataIndex: "application_document_code",
      sorter: nullableStringOrNumberSorter("application_document_code"),
      render: (text) => (
        <div title="Document Type">{props.applicationDocumentTypeOptionsHash[text]}</div>
      ),
    },
  ];

  const documents = props.documents.sort(dateSorter("upload_date"));
  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        rowKey={(record) => record.application_document_guid}
        locale={{ emptyText: "This application does not contain any documents." }}
        dataSource={documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;

export default DocumentTable;
