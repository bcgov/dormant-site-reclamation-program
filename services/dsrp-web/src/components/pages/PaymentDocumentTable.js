import React from "react";
import PropTypes from "prop-types";
import { Table, Popconfirm, Button, Icon, Typography } from "antd";
import { formatDateTime, truncateFilename } from "@/utils/helpers";
import { downloadPaymentDocument } from "@/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const { Title } = Typography;

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.document).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  application_guid: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  onDocumentDelete: PropTypes.func.isRequired,
  emptyText: PropTypes.string.isRequired,
  tableTitle: PropTypes.string.isRequired,
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
                downloadPaymentDocument(
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
      render: (text) => (
        <div title="Upload date">{formatDateTime(text) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "",
      key: "handleEditModal",
      dataIndex: "handleEditModal",
      render: (text, record) => (
        <div align="right" className="btn--middle flex">
          {/* TODO may be add admin permission check */}
          <AuthorizationWrapper>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to delete this Payment request?"
              onConfirm={() => props.onDocumentDelete(props.application_guid, record.document_guid)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button type="link" className="color-primary">
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

export default PaymentDocumentTable;
