import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button, Icon, Typography } from "antd";
import { formatDate, truncateFilename } from "@/utils/helpers";
import { downloadFileFromDocumentManager } from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const { Title } = Typography;

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.document),
  tableTitle: PropTypes.string.isRequired,
  emptyText: PropTypes.string.isRequired,
  application_guid: PropTypes.string.isRequired,
};

const defaultProps = {
  documents: [],
};

export const PaymentDocumentTable = (props) => {
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
                  record.document_guid,
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
    {
      title: "",
      key: "handleEditModal",
      dataIndex: "handleEditModal",
      render: (/* text, record */) => (
        <div align="right" className="btn--middle flex">
          {/* TODO may be add admin permission check */}
          <AuthorizationWrapper>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to delete this Payment request?"
              // onConfirm={() => record.handleDeletePaymentRequest(record.incident)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button ghost size="small" type="primary">
                <Icon type="delete" theme="filled" className="icon-lg" />
              </Button>
            </Popconfirm>
          </AuthorizationWrapper>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} className="documents-section">
        {props.tableTitle}
      </Title>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        rowKey={(record) => record.document_guid}
        locale={{
          emptyText: props.emptyText,
        }}
        dataSource={props.documents}
      />
    </div>
  );
};

PaymentDocumentTable.propTypes = propTypes;
PaymentDocumentTable.defaultProps = defaultProps;

export default PaymentDocumentTable;
