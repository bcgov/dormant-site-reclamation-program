/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table, Icon } from "antd";
import { formatDateTime, formatDateTimeFine } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applications: PropTypes.any.isRequired,
};

const columns = [
  {
    title: "Application ID",
    key: "id",
    dataIndex: "id",
    render: (text) => <div title="id">{text || Strings.DASH}</div>,
  },
  {
    title: "Company",
    key: "company_name",
    dataIndex: "company_name",
    render: (text) => <div title="Company">{text || Strings.DASH}</div>,
  },
  {
    title: "Received On",
    key: "submission_date",
    dataIndex: "submission_date",
    sortField: "submission_date",
    sorter: true,
    render: (text) => (
      <div title={`Received On: ${formatDateTimeFine(text)}`}>{formatDateTime(text)}</div>
    ),
  },
  {
    title: "Permit Holder",
    key: "permit_holder",
    dataIndex: "permit_holder",
    render: (text) => <div title="Permit Holder">{text || Strings.DASH}</div>,
  },
  {
    title: "No. of Well Sites",
    key: "wells",
    dataIndex: "wells",
    render: (text) => <div title="No. of Well Sites">{text || Strings.DASH}</div>,
  },
  {
    title: "No. of Work Types",
    key: "cost",
    dataIndex: "cost",
    render: (text) => <div title="No. of Work Types">{text || Strings.DASH}</div>,
  },
  {
    title: "Total Est. Cost",
    key: "amount",
    dataIndex: "amount",
    render: (text) => <div title="Total Est. Cost">{text || Strings.DASH}</div>,
  },
  {
    title: "Est. Shared Cost",
    key: "payment",
    dataIndex: "payment",
    render: (text) => <div title="Est. Shared Cost">{text || Strings.DASH}</div>,
  },
  {
    title: "Status",
    key: "application_status_code",
    dataIndex: "application_status_code",
    render: (text) => <div title="Est. Shared Cost">{text || Strings.DASH}</div>,
  },
  {
    key: "operations",
    render: (text, record) => (
      <div title="View">
        <Link to={route.VIEW_APPLICATION.dynamicRoute(record.key)}>
          <Icon type="eye" className="icon-lg" />
        </Link>
      </div>
    ),
  },
];

export class ApplicationTable extends Component {
  onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  transformRowData = (applications) => {
    const apps = applications.map((application) => {
      return {
        key: application.guid,
        company_name: application.json.company_details.company_name.label,
        permit_holder: application.json.contract_details.organization_id,
        wells: application.json.well_sites ? application.json.well_sites.length : 0,
        cost: Strings.DASH,
        amount: Strings.DASH,
        payment: Strings.DASH,
        ...application,
      };
    });
    return apps;
  };

  render() {
    return (
      <>
        <Table
          columns={columns}
          pagination={true}
          dataSource={this.transformRowData(this.props.applications)}
          onChange={this.onChange}
          expandable={{
            expandedRowRender: () => <p style={{ margin: 0 }}>Surprise! more content here</p>,
          }}
        />
      </>
    );
  }
}

ApplicationTable.propTypes = propTypes;
// ApplicationTable.defaultProps = defaultProps;

export default ApplicationTable;
