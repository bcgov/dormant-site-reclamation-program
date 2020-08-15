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
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.document).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  application_guid: PropTypes.string.isRequired,
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "File name",
      dataIndex: "document_name",
      sorter: nullableStringOrNumberSorter("document_name"),
      render: (text, record) => {
        return (
          <div title="File name">
            <LinkButton
              title={text}
              onClick={() =>
                downloadDocument(
                  props.application_guid,
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
      title: "Upload date",
      dataIndex: "upload_date",
      sorter: dateSorter("upload_date"),
      render: (text) => (
        <div title="Upload date">{formatDateTime(text) || Strings.EMPTY_FIELD}</div>
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
        rowKey={(record) => record.mine_document_guid}
        locale={{ emptyText: "This application does not contain any documents." }}
        dataSource={documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;

export default DocumentTable;
