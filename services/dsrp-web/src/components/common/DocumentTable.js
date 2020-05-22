import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { formatDate, truncateFilename } from "@/utils/helpers";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.document).isRequired,
  application_guid: PropTypes.string,
};

const defaultProps = {
  documents: [],
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "File name",
      dataIndex: "document_name",
      render: (text, record) => {
        return (
          <div title="File name">
            <LinkButton
              title={text}
              onClick={() =>
                downloadFileFromDocumentManager(
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
      render: (text) => <div title="Upload date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
  ];

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        rowKey={(record) => record.mine_document_guid}
        locale={{ emptyText: "This application does not contain any documents." }}
        dataSource={props.documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
