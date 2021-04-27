/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { openModal, closeModal } from "@/actions/modalActions";
import { Table, Icon, Tooltip, Pagination, Menu, Dropdown, Input, Button } from "antd";
import { formatDateTime, formatDate, formatMoney, formatDateTimeFine } from "@/utils/helpers";
import { getFilterListApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  applications: PropTypes.any.isRequired,
  filterListApplicationStatusOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  applicationPhaseDropdownOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  applicationPhaseOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  handleTableChange: PropTypes.func.isRequired,
  handleAdminOverrideEstimatedCost: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  params: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
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
    const fetchWells =
      record.application_phase_code === Strings.APPLICATION_PHASE_CODES.INITIAL
        ? this.props.fetchWells({ application_guid: record.key })
        : this.props.fetchNominatedWells({ application_guid: record.key });

    return Promise.all([this.props.fetchLiabilities(record.key), fetchWells]).then(() =>
      this.setState((prevState) => {
        const expandedRowKeys = expanded
          ? prevState.expandedRowKeys.concat(record.key)
          : prevState.expandedRowKeys.filter((key) => key !== record.key);
        return { expandedRowKeys };
      })
    );
  };

  getTotalEstCost = (contractedWorks) =>
    contractedWorks.reduce(
      (sum, cw) =>
        sum + parseFloat(cw.est_cost_override !== null ? cw.est_cost_override : cw.est_cost),
      0
    );

  getTotalEstSharedCost = (contractedWorks) =>
    contractedWorks.reduce(
      (sum, cw) =>
        sum +
        parseFloat(
          cw.est_shared_cost_override !== null ? cw.est_shared_cost_override : cw.est_shared_cost
        ),
      0
    );

  getNoWorkTypes = (guid) =>
    this.props.applicationsWellSitesContractedWork.filter(
      ({ application_guid }) => application_guid === guid
    ).length;

  transformRowData = (applications) => {
    const data = applications.map((application) => {
      const contractedWorks = this.props.applicationsWellSitesContractedWork.filter(
        (cw) => cw.application_guid === application.guid
      );
      return {
        ...application,
        key: application.guid,
        application_guid: application.guid,
        company_name: application.json.company_details.company_name.label,
        permit_holder: this.props.permitHoldersHash[application.json.contract_details.operator_id],
        wells: application.json.well_sites ? application.json.well_sites.length : 0,
        work_types: this.getNoWorkTypes(application.guid),
        est_cost: this.getTotalEstCost(contractedWorks),
        est_shared_cost: this.getTotalEstSharedCost(contractedWorks),
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

  openAdminOverrideEstimatedCostModal = (contractedWork) =>
    this.props.openModal({
      width: 1000,
      props: {
        title: `Override Estimated Cost for Work ID ${contractedWork.work_id}`,
        contractedWork: contractedWork,
        initialValues: { est_cost_override: contractedWork.est_cost_override },
        onSubmit: this.props.handleAdminOverrideEstimatedCost,
      },
      content: modalConfig.ADMIN_OVERRIDE_ESTIMATED_COST,
    });

  render() {
    const phaseOptionsFilter = this.props.applicationPhaseDropdownOptions.map((p) => {
      return { value: p.value, text: p.label };
    });

    const columns = [
      {
        title: "Application ID",
        key: "id",
        dataIndex: "id",
        sortField: "id",
        sorter: true,
        filterDropdown: this.columnSearchInput("id", "Enter Application ID"),
        filterIcon: () => this.searchFilterIcon("id"),
        render: (text) => <div title={`Application ID: ${text}`}>{text}</div>,
      },
      {
        title: "Company",
        key: "company_name",
        dataIndex: "company_name",
        filterDropdown: this.columnSearchInput("company_name", "Enter Company Name"),
        filterIcon: () => this.searchFilterIcon("company_name"),
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
                trigger={["click"]}
              >
                <a>
                  {this.props.applicationStatusOptionsHash[text] || Strings.ERROR}
                  <Icon type="down" className="table-status-dropdown-icon" />
                </a>
              </Dropdown>
            </span>
          </div>
        ),
      },
      {
        title: "Phase",
        key: "application_phase_code",
        dataIndex: "application_phase_code",
        sortField: "application_phase_code",
        sorter: true,
        filters: phaseOptionsFilter,
        filteredValue: isArray(this.props.params.application_phase_code)
          ? this.props.params.application_phase_code
          : this.props.params.application_phase_code
          ? [this.props.params.application_phase_code]
          : [],
        render: (text, record) => (
          <span> {this.props.applicationPhaseOptionsHash[text] || Strings.ERROR}</span>
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

          const isOverridden = record.est_cost_override !== null;
          const estCost = isOverridden ? record.est_cost_override : text;

          return (
            <div style={{ textAlign: "right" }} title="Est. Cost">
              {isOverridden &&
                toolTip(
                  `Est. Cost was overridden by admin. Original value: ${formatMoney(text)}`,
                  "color-warning table-record-tooltip"
                )}
              {(lmr || lmr === 0) &&
                Number(estCost) * 1.15 >= lmr &&
                toolTip("Est. Cost exceeds LMR by 15% or more", "color-error table-record-tooltip")}
              {formatMoney(estCost) || Strings.DASH}
              <Button
                type="link"
                onClick={() => this.openAdminOverrideEstimatedCostModal(record)}
                size="small"
              >
                <Icon type="edit" style={{ marginLeft: 4 }} />
              </Button>
            </div>
          );
        },
      },
      {
        title: "Est. Shared Cost",
        key: "est_shared_cost",
        dataIndex: "est_shared_cost",
        render: (text, record) => {
          const isOverridden = record.est_cost_override !== null;
          const estSharedCost = isOverridden ? record.est_shared_cost_override : text;
          return (
            <div style={{ textAlign: "right" }} title="Est. Shared Cost">
              {formatMoney(estSharedCost) || Strings.DASH}
            </div>
          );
        },
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
                trigger={["click"]}
              >
                <a>
                  {this.props.contractedWorkStatusOptionsHash[text] || Strings.ERROR}
                  <Icon type="down" className="table-status-dropdown-icon" />
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

    console.log(this.transformRowData(this.props.applications));
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
          loading={{
            spinning: !this.props.isLoaded,
          }}
        />
        <br />
        {!isEmpty(this.props.applications) && (
          <div className="center">
            <Pagination
              defaultCurrent={Number(this.props.params.page)}
              defaultPageSize={Number(this.props.params.per_page)}
              pageSizeOptions={Strings.PAGE_SIZE_OPTIONS}
              current={this.props.pageData.current_page}
              total={this.props.pageData.total}
              pageSize={this.props.pageData.items_per_page}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={this.props.onPageChange}
              onShowSizeChange={this.props.onPageChange}
              showSizeChanger
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationTable);
