/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table, Icon, Tooltip, Pagination, Menu, Dropdown } from "antd";
import { formatDateTime, formatDate, formatMoney, formatDateTimeFine } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applications: PropTypes.any.isRequired,
};

const menu = (statusArr) => (
  <Menu>
    {statusArr.map(({ label, value }) => {
      <Menu.Item key="value">label</Menu.Item>;
    })}
  </Menu>
);

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
    // sorter: true,
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
    dataIndex: "work_types",
    render: (text) => <div title="No. of Work Types">{text || Strings.DASH}</div>,
  },
  {
    title: "Total Est. Cost",
    dataIndex: "est_cost",
    render: (text) => <div title="Total Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
  },
  {
    title: "Est. Shared Cost",
    dataIndex: "est_shared_cost",
    render: (text) => <div title="Est. Shared Cost">{formatMoney(text) || Strings.DASH}</div>,
  },
  {
    title: "Status",
    key: "application_status_code",
    dataIndex: "application_status_code",
    render: (text) => (
      <div title="Status">
        {
          <Dropdown overlay={menu([])}>
            <a onClick={(e) => e.preventDefault()}>
              {text} <Icon type="down" className="icon-lg" />
            </a>
          </Dropdown>
        }
      </div>
    ),
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

const nestedColumns = [
  {
    title: "Well Auth No.",
    dataIndex: "well_no",
    render: (text) => <div title="Well Auth No.">{text || Strings.DASH}</div>,
  },
  {
    title: "Work Type",
    dataIndex: "work_type",
    render: (text) => <div title="Work Type">{text || Strings.DASH}</div>,
  },
  {
    title: "Priority Criteria",
    dataIndex: "priority_criteria",
    render: (text) => <div title="Well Auth No.">{text || Strings.DASH}</div>,
  },
  {
    title: "Location",
    dataIndex: "location",
    render: (text) => <div title="Location">{formatDate(text) || Strings.DASH}</div>,
  },
  {
    title: "Completion Date",
    dataIndex: "completion_date",
    render: (text) => <div title="Completion Date">{formatDate(text) || Strings.DASH}</div>,
  },
  {
    title: "Est. Cost",
    dataIndex: "est_cost",
    render: (text) => <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
  },
  {
    title: "Est. Shared Cost",
    dataIndex: "est_shared_cost",
    render: (text) => <div title="Est. Shared Cost">{formatMoney(text) || Strings.DASH}</div>,
  },
  {
    title: "LMR Value",
    dataIndex: "LMR",
    render: (text) => <div title="LMR Value">{text || Strings.DASH}</div>,
  },
  {
    title: "OGC Status",
    dataIndex: "OGC_status",
    render: (text) => <div title="OGC Status">{text || Strings.DASH}</div>,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (text) => <div title="Status">{text || Strings.DASH}</div>,
  },
];

export class ApplicationTable extends Component {
  state = { expandedRowKeys: [] };
  onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  onExpand = (expanded, record) =>
    this.setState((prevState) => {
      const expandedRowKeys = expanded
        ? prevState.expandedRowKeys.concat(record.key)
        : prevState.expandedRowKeys.filter((key) => key !== record.key);
      return { expandedRowKeys };
    });

  getSum = (guid, field) =>
    this.props.workTypes
      .filter(({ key }) => key === guid)
      .reduce((sum, type) => +sum + +type[field], 0);

  getNoWorkTypes = (guid) => this.props.workTypes.filter(({ key }) => key === guid).length;

  transformRowData = (applications) => {
    const apps = applications.map((application) => {
      return {
        key: application.guid,
        company_name: application.json.company_details.company_name.label,
        permit_holder: application.json.contract_details.organization_id,
        wells: application.json.well_sites ? application.json.well_sites.length : 0,
        work_types: this.getNoWorkTypes(application.guid),
        est_cost: this.getSum(application.guid, "est_cost"),
        est_shared_cost: this.getSum(application.guid, "est_shared_cost"),
        payment: Strings.DASH,
        ...application,
      };
    });
    return apps;
  };

  renderTableExpandIcon = (rowProps) => (
    <a
      role="link"
      className="expand-row-icon"
      onClick={(e) => rowProps.onExpand(rowProps.record, e)}
      onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
      style={{ cursor: "pointer" }}
      tabIndex="0"
    >
      {rowProps.expanded ? (
        <Tooltip title="Click to hide." placement="right" mouseEnterDelay={1}>
          <Icon type="minus-square" theme="filled" className="icon-lg" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view." placement="right" mouseEnterDelay={1}>
          <Icon type="plus-square" theme="filled" className="icon-lg" />
        </Tooltip>
      )}
    </a>
  );

  wells = (record) => {
    return (
      <div className="nested-table">
        <Table
          align="left"
          pagination={false}
          columns={nestedColumns}
          dataSource={this.props.workTypes.filter(({ key }) => key === record.key)}
          style={{ backgroundColor: "#f7f8fa" }}
        />
      </div>
    );
  };

  render() {
    return (
      <>
        <Table
          columns={columns}
          pagination={false}
          dataSource={this.transformRowData(this.props.applications)}
          onChange={this.onChange}
          expandIcon={this.renderTableExpandIcon}
          expandRowByClick={true}
          expandedRowRender={this.wells}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
        />
        <div className="center">
          <Pagination
            // hideOnSinglePage
            defaultCurrent={this.props.pageData.current_page}
            total={this.props.pageData.total}
            // onChange={(page, per_page) => this.props.fetchApplications(page, per_page)}
          />
        </div>
      </>
    );
  }
}

ApplicationTable.propTypes = propTypes;
// ApplicationTable.defaultProps = defaultProps;

export default ApplicationTable;
