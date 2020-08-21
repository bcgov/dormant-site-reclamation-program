/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty } from "lodash";
import { Table, Icon, Tooltip, Pagination, Menu, Dropdown, Input, Button } from "antd";
import { formatDateTime, formatDate, formatMoney, formatDateTimeFine } from "@/utils/helpers";
import { getFilterListApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applications: PropTypes.any.isRequired,
  filterListApplicationStatusOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  handleTableChange: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  params: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {};

const renderDropdownMenu = (option, onClick, record, currentStatus) => (
  <Menu onClick={(item) => onClick(item, record)}>
    {option
      .filter(({ value }) => value !== currentStatus)
      .map(({ label, value, description }) => (
        <Menu.Item title={description} key={value}>
          {label}
        </Menu.Item>
      ))}
  </Menu>
);

const applySortIndicator = (columns, params) =>
  columns.map((column) => ({
    ...column,
    sortOrder:
      params.sort_dir && column.sortField === params.sort_field
        ? params.sort_dir.concat("end")
        : false,
  }));

const handleTableChange = (updateApplications, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    page: pagination.current,
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };
  updateApplications(params);
};

export const toolTip = (title, extraClassName) => (
  <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Tooltip>
);

export class ApplicationTable extends Component {
  state = { expandedRowKeys: [] };

  onExpand = (expanded, record) => {
    this.props.fetchLiabilities(record.key).then(() => {
      this.props.fetchWells({ application_guid: record.key }).then(() => {
        this.setState((prevState) => {
          const expandedRowKeys = expanded
            ? prevState.expandedRowKeys.concat(record.key)
            : prevState.expandedRowKeys.filter((key) => key !== record.key);
          return { expandedRowKeys };
        });
      });
    });
  };

  getSum = (guid, field) =>
    this.props.applicationsWellSitesContractedWork
      .filter(({ application_guid }) => application_guid === guid)
      .reduce((sum, type) => +sum + +type[field], 0);

  getNoWorkTypes = (guid) =>
    this.props.applicationsWellSitesContractedWork.filter(
      ({ application_guid }) => application_guid === guid
    ).length;

  transformRowData = (applications) => {
    const data = applications.map((application) => {
      return {
        ...application,
        key: application.guid,
        application_guid: application.guid,
        company_name: application.json.company_details.company_name.label,
        permit_holder: this.props.permitHoldersHash[application.json.contract_details.operator_id],
        wells: application.json.well_sites ? application.json.well_sites.length : 0,
        work_types: this.getNoWorkTypes(application.guid),
        est_cost: this.getSum(application.guid, "est_cost"),
        est_shared_cost: this.getSum(application.guid, "est_shared_cost"),
        payment: null,
      };
    });
    return data;
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

  transformNestedRowData = (wellSitesContractWork) => {
    const data = wellSitesContractWork.map((wellSiteContractWork) => {
      return {
        ...wellSiteContractWork,
      };
    });
    return data;
  };

  handleSearch = (selectedKeys, dataIndex) => {
    const params = {
      ...this.props.params,
      [dataIndex]: (isArray(selectedKeys) && selectedKeys[0]) || selectedKeys,
    };
    this.props.handleTableChange(params);
  };

  handleReset = (dataIndex, clearFilters) => {
    const params = {
      ...this.props.params,
      [dataIndex]: undefined,
    };
    this.props.handleTableChange(params);
    clearFilters();
  };

  columnSearchInput = (dataIndex, placeholder) => ({
    setSelectedKeys,
    selectedKeys,
    clearFilters,
  }) => {
    return (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {}}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block", fontSize: 12 }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, dataIndex)}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(dataIndex, clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    );
  };

  searchFilterIcon = (dataIndex) => {
    return (
      <Icon
        type="search"
        theme="outlined"
        className={this.props.params[dataIndex] ? "color-primary" : ""}
      />
    );
  };

  render() {
    const columns = [
      {
        title: "Application ID",
        key: "id",
        dataIndex: "id",
        sortField: "id",
        sorter: true,
        render: (text) => <div title={`Application ID: ${text}`}>{text}</div>,
      },
      {
        title: "Company",
        key: "company_name",
        dataIndex: "company_name",
        render: (text) => <div title="Company">{text || Strings.DASH}</div>,
        filterDropdown: this.columnSearchInput("company_name", "Enter Company Name"),
        filterIcon: () => this.searchFilterIcon("company_name"),
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
        render: (text) => (
          <div style={{ textAlign: "right" }} title="No. of Well Sites">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "No. of Work Types",
        key: "work_types",
        dataIndex: "work_types",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="No. of Work Types">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "Total Est. Cost",
        key: "est_cost",
        dataIndex: "est_cost",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Total Est. Cost">
            {formatMoney(text) || Strings.DASH}
          </div>
        ),
      },
      {
        title: (
          <>
            Total Est. Shared Cost
            {toolTip(
              `Estimated Shared Cost:\nThis value is calculated as 50% of estimated cost of each approved work type or a maximum of ${formatMoney(
                100000
              )}`
            )}
          </>
        ),
        key: "est_shared_cost",
        dataIndex: "est_shared_cost",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Est. Shared Cost">
            {formatMoney(text) || Strings.DASH}
          </div>
        ),
      },
      {
        title: "Status",
        key: "application_status_code",
        dataIndex: "application_status_code",
        sortField: "application_status_code",
        sorter: true,
        filters: this.props.filterListApplicationStatusOptions,
        filteredValue: isArray(this.props.params.application_status_code)
          ? this.props.params.application_status_code
          : this.props.params.application_status_code
          ? [this.props.params.application_status_code]
          : [],
        render: (text, record) => (
          <div title="Status">
            <span onClick={(e) => e.stopPropagation()}>
              <Dropdown
                overlay={renderDropdownMenu(
                  this.props.applicationStatusDropdownOptions,
                  this.props.handleApplicationStatusChange,
                  record,
                  text
                )}
                trigger={["hover", "click"]}
              >
                <a>
                  {this.props.applicationStatusOptionsHash[text] || Strings.ERROR}&nbsp;
                  <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          </div>
        ),
      },
      {
        key: "operations",
        render: (text, record) => (
          <div title="View">
            <Link to={route.VIEW_APPLICATION.dynamicRoute(record.application_guid)}>
              <Icon type="eye" className="icon-lg" />
            </Link>
          </div>
        ),
      },
    ];

    const nestedColumns = [
      {
        title: "Work ID",
        key: "work_id",
        dataIndex: "work_id",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Work ID">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "Well Auth No.",
        key: "well_authorization_number",
        dataIndex: "well_authorization_number",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Well Auth No.">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "Work Type",
        key: "contracted_work_type_description",
        dataIndex: "contracted_work_type_description",
        render: (text) => <div title="Work Type">{text || Strings.DASH}</div>,
      },
      {
        title: "Priority Criteria",
        key: "priority_criteria",
        dataIndex: "priority_criteria",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Priority Criteria">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "Location",
        key: "location",
        dataIndex: "location",
        render: (text) => <div title="Location">{text || Strings.DASH}</div>,
      },
      {
        title: "Completion Date",
        key: "completion_date",
        dataIndex: "completion_date",
        render: (text) => <div title="Completion Date">{formatDate(text) || Strings.DASH}</div>,
      },
      {
        title: "Est. Cost",
        key: "est_cost",
        dataIndex: "est_cost",
        render: (text, record) => {
          // NOTE: LMR is returned formatted, e.g., $50,000, so remove non-numeric characters.
          const lmr = record.LMR && parseFloat(record.LMR.replace(/[^0-9.-]+/g, ""));
          return (
            <div style={{ textAlign: "right" }} title="Est. Cost">
              {(lmr || lmr === 0) &&
                Number(text) * 1.15 >= lmr &&
                toolTip("Est. Cost exceeds LMR by 15% or more", "color-error table-record-tooltip")}
              {formatMoney(text) || Strings.DASH}
            </div>
          );
        },
      },
      {
        title: "Est. Shared Cost",
        key: "est_shared_cost",
        dataIndex: "est_shared_cost",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="Est. Shared Cost">
            {formatMoney(text) || Strings.DASH}
          </div>
        ),
      },
      {
        title: "LMR Value",
        key: "LMR",
        dataIndex: "LMR",
        render: (text) => (
          <div style={{ textAlign: "right" }} title="LMR Value">
            {text || Strings.DASH}
          </div>
        ),
      },
      {
        title: "OGC Status",
        key: "OGC_status",
        dataIndex: "OGC_status",
        render: (text) => <div title="OGC Status">{text || Strings.DASH}</div>,
      },
      {
        title: "Status",
        key: "contracted_work_status_code",
        dataIndex: "contracted_work_status_code",
        render: (text, record) => (
          <div title="Status">
            <span onClick={(e) => e.stopPropagation()}>
              <Dropdown
                overlay={renderDropdownMenu(
                  this.props.contractedWorkStatusDropdownOptions,
                  this.props.handleContractedWorkStatusChange,
                  record,
                  text
                )}
                trigger={["hover", "click"]}
              >
                <a>
                  {this.props.contractedWorkStatusOptionsHash[text] || Strings.ERROR}&nbsp;
                  <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          </div>
        ),
      },
    ];

    const wellSitesContractedWorkTable = (record) => {
      return (
        <div className="nested-table">
          <Table
            align="left"
            pagination={false}
            columns={nestedColumns}
            dataSource={this.transformNestedRowData(
              this.props.applicationsWellSitesContractedWork.filter(
                ({ application_guid }) => application_guid === record.application_guid
              )
            )}
            style={{ backgroundColor: "#f7f8fa" }}
          />
        </div>
      );
    };

    return (
      <>
        <Table
          columns={applySortIndicator(columns, this.props.params)}
          pagination={false}
          dataSource={this.transformRowData(this.props.applications)}
          expandIcon={this.renderTableExpandIcon}
          expandRowByClick={true}
          expandedRowRender={wellSitesContractedWorkTable}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
          onChange={handleTableChange(this.props.handleTableChange, this.props.params)}
          className="table-headers-center"
          loading={!this.props.isLoaded}
        />
        <br />
        {!isEmpty(this.props.applications) && (
          <div className="center">
            <Pagination
              defaultCurrent={Number(this.props.params.page)}
              current={Number(this.props.params.page)}
              total={Number(this.props.pageData.total)}
              pageSize={Number(this.props.params.per_page)}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={this.props.onPageChange}
            />
          </div>
        )}
      </>
    );
  }
}

ApplicationTable.propTypes = propTypes;
ApplicationTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  filterListApplicationStatusOptions: getFilterListApplicationStatusOptions(state),
});

export default connect(mapStateToProps)(ApplicationTable);
