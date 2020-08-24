import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty, startCase, camelCase } from "lodash";
import {
  Table,
  Icon,
  Pagination,
  Menu,
  Dropdown,
  Input,
  Button,
  Popover,
  Divider,
  Row,
  Col,
} from "antd";
import { formatMoney } from "@/utils/helpers";
import {
  getFilterListContractedWorkPaymentStatusOptions,
  getFilterListContractedWorkTypeOptions,
  getDropdownContractedWorkPaymentStatusOptions,
} from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applicationsApprovedContractedWork: PropTypes.any.isRequired,
  filterListContractedWorkPaymentStatusOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  filterListContractedWorkTypeOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  onSelectedRowsChanged: PropTypes.func.isRequired,
  handleContractedWorkPaymentInterimStatusChange: PropTypes.func.isRequired,
  handleContractedWorkPaymentFinalStatusChange: PropTypes.func.isRequired,
  contractedWorkPaymentStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  handleTableChange: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  params: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {};

const renderDropdownMenu = (option, onClick, record, currentStatus) => (
  <Menu onClick={(item) => onClick(item.key, record)}>
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

const handleTableChange = (updateParams, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    page: pagination.current,
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };

  updateParams(params);
};

const popover = (message, extraClassName) => (
  <Popover title="Admin Note" content={message}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Popover>
);

const getApplicationIdFromWorkId = (workId) => parseInt(workId.split(".")[0]);

export class ApprovedContractedWorkPaymentTable extends Component {
  state = {
    selectedRowKeys: [],
    selectedApplicationId: null,
    possibleSelectedRowKeys: [],
  };

  getParamFilteredValue = (key) => {
    const val = this.props.params[key];
    return isArray(val) ? val : val ? [val] : [];
  };

  transformRowData = (applicationApprovedContractedWork) => {
    const data = applicationApprovedContractedWork.map((work) => {
      const contracted_work_payment = work.contracted_work_payment || {};
      const { interim_payment_submission_date } = contracted_work_payment;
      let interim_report_days_until_deadline = Infinity;
      if (interim_payment_submission_date) {
        if (contracted_work_payment.interim_report) {
          interim_report_days_until_deadline = -Infinity;
        } else {
          const daysToSubmit = 30;
          const daysLeftCount =
            daysToSubmit - moment().diff(moment(interim_payment_submission_date), "days");
          interim_report_days_until_deadline = daysLeftCount;
        }
      }
      return {
        ...work,
        key: work.work_id,
        interim_cost: parseFloat(contracted_work_payment.interim_actual_cost),
        final_cost: parseFloat(contracted_work_payment.final_actual_cost),
        interim_payment_status_code:
          contracted_work_payment.interim_payment_status_code || "INFORMATION_REQUIRED",
        final_payment_status_code:
          contracted_work_payment.final_payment_status_code || "INFORMATION_REQUIRED",
        has_interim_prfs: contracted_work_payment.has_interim_prfs || false,
        has_final_prfs: contracted_work_payment.has_final_prfs || false,
        interim_eoc: contracted_work_payment.interim_eoc_application_document_guid,
        final_eoc: contracted_work_payment.final_eoc_application_document_guid,
        interim_report_days_until_deadline,
        review_deadlines: contracted_work_payment ? contracted_work_payment.review_deadlines : null,
        work,
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
        className={!isEmpty(this.props.params[dataIndex]) ? "color-primary" : ""}
      />
    );
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: selectedRowKeys,
    });
    this.props.onSelectedRowsChanged(selectedRows);
  };

  onSelect = (record, selected, selectedRows) =>
    this.setState({
      selectedApplicationId: selected
        ? record.application_id
        : !isEmpty(selectedRows)
        ? record.application_id
        : null,
    });

  onSelectAll = (selected, selectedRows) => {
    const selectedApplicationId = selected
      ? this.state.selectedApplicationId
        ? this.state.selectedApplicationId
        : !isEmpty(selectedRows)
        ? selectedRows[0].application_id
        : null
      : null;

    selectedRows = selectedRows.filter(
      ({ application_id }) => selectedApplicationId === application_id
    );
    const selectedRowKeys = selectedRows.reduce((list, record) => [...list, record.work_id], []);

    this.setState({
      selectedRowKeys: selectedRowKeys,
      selectedApplicationId: selectedApplicationId,
    });

    this.props.onSelectedRowsChanged(selectedRows);
  };

  render() {
    const columns = [
      {
        title: "Application ID",
        key: "application_id",
        dataIndex: "application_id",
        sortField: "application_id",
        sorter: true,
        filterDropdown: this.columnSearchInput("application_id", "Enter Application ID"),
        filterIcon: () => this.searchFilterIcon("application_id"),
        render: (text, record) => (
          <div title="Application ID">
            <Link to={route.VIEW_APPLICATION.dynamicRoute(record.application_guid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Work ID",
        key: "work_id",
        dataIndex: "work_id",
        sortField: "work_id",
        sorter: true,
        filterDropdown: this.columnSearchInput("work_id", "Enter Work ID"),
        filterIcon: () => this.searchFilterIcon("work_id"),
        render: (text) => <div title="Work ID">{text}</div>,
      },
      {
        title: "Well Auth No.",
        key: "well_authorization_number",
        dataIndex: "well_authorization_number",
        sortField: "well_authorization_number",
        sorter: true,
        filterDropdown: this.columnSearchInput("well_authorization_number", "Enter Well Auth No."),
        filterIcon: () => this.searchFilterIcon("well_authorization_number"),
        render: (text) => <div title="Well Auth No.">{text}</div>,
      },
      {
        title: "Work Type",
        key: "contracted_work_type",
        dataIndex: "contracted_work_type",
        sortField: "contracted_work_type",
        sorter: true,
        filters: this.props.filterListContractedWorkTypeOptions,
        filteredValue: this.getParamFilteredValue("contracted_work_type"),
        render: (text) => <div title="Work Type">{startCase(camelCase(text))}</div>,
      },
      // {
      //   title: "Est. Cost",
      //   key: "contracted_work_total",
      //   dataIndex: "contracted_work_total",
      //   render: (text) => <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
      // },
      {
        title: "Interim Cost",
        key: "interim_cost",
        dataIndex: "interim_cost",
        render: (text) => <div title="Interim Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      // {
      //   title: "Interim EoC",
      //   key: "interim_eoc",
      //   dataIndex: "interim_eoc",
      //   render: (text) => (
      //     <div title="Interim EoC">
      //       {(text && (
      //         <LinkButton
      //           onClick={() =>
      //             downloadDocument(
      //               this.props.applicationGuid,
      //               text,
      //               "Dormant Sites Reclamation Program - Evidence of Cost.pdf"
      //             )
      //           }
      //         >
      //           Download
      //         </LinkButton>
      //       )) ||
      //         Strings.DASH}
      //     </div>
      //   ),
      // },
      {
        title: "Interim Status",
        key: "interim_payment_status_code",
        dataIndex: "interim_payment_status_code",
        sortField: "interim_payment_status_code",
        sorter: true,
        filters: this.props.filterListContractedWorkPaymentStatusOptions,
        filteredValue: this.getParamFilteredValue("interim_payment_status_code"),
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.interim_payment_status
              ? record.contracted_work_payment.interim_payment_status.note
              : null;
          return (
            <div title="Interim Status">
              <span onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  disabled={
                    !record.contracted_work_payment ||
                    isEmpty(record.contracted_work_payment.interim_payment_status)
                  }
                  overlay={renderDropdownMenu(
                    this.props.contractedWorkPaymentStatusDropdownOptions,
                    this.props.handleContractedWorkPaymentInterimStatusChange,
                    record,
                    text
                  )}
                  trigger={["hover", "click"]}
                >
                  <a>
                    {note && popover(note, "table-record-tooltip")}
                    {this.props.contractedWorkPaymentStatusOptionsHash[text]}
                    <Icon type="down" className="table-status-dropdown-icon" />
                  </a>
                </Dropdown>
              </span>
            </div>
          );
        },
      },
      // {
      //   title: "Progress Report Status",
      //   key: "interim_report_days_until_deadline",
      //   dataIndex: "interim_report_days_until_deadline",
      //   sortField: "interim_report_days_until_deadline",
      //   sorter: false,
      //   render: (text) => {
      //     let display = null;
      //     if (text === -Infinity) {
      //       display = "Submitted";
      //     } else if (text === Infinity) {
      //       display = Strings.DASH;
      //     } else {
      //       display = `${text} days to submit`;
      //     }
      //     return <div title="Progress Report Status">{display}</div>;
      //   },
      // },
      {
        title: "Final Cost",
        key: "final_cost",
        dataIndex: "final_cost",
        render: (text) => <div title="Final Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
      // {
      //   title: "Final EoC",
      //   key: "final_eoc",
      //   dataIndex: "final_eoc",
      //   render: (text) => (
      //     <div title="Final EoC">
      //       {(text && (
      //         <LinkButton
      //           onClick={() =>
      //             downloadDocument(
      //               this.props.applicationGuid,
      //               text,
      //               "Dormant Sites Reclamation Program - Evidence of Cost.pdf"
      //             )
      //           }
      //         >
      //           Download
      //         </LinkButton>
      //       )) ||
      //         Strings.DASH}
      //     </div>
      //   ),
      // },
      {
        title: "Final Status",
        key: "final_payment_status_code",
        dataIndex: "final_payment_status_code",
        sortField: "final_payment_status_code",
        sorter: true,
        filters: this.props.filterListContractedWorkPaymentStatusOptions,
        filteredValue: this.getParamFilteredValue("final_payment_status_code"),
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.final_payment_status
              ? record.contracted_work_payment.final_payment_status.note
              : null;
          return (
            <div title="Final Status">
              <span onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  disabled={
                    !record.contracted_work_payment ||
                    isEmpty(record.contracted_work_payment.final_payment_status)
                  }
                  overlay={renderDropdownMenu(
                    this.props.contractedWorkPaymentStatusDropdownOptions,
                    this.props.handleContractedWorkPaymentFinalStatusChange,
                    record,
                    text
                  )}
                  trigger={["hover", "click"]}
                >
                  <a>
                    {note && popover(note, "table-record-tooltip")}
                    {this.props.contractedWorkPaymentStatusOptionsHash[text]}
                    <Icon type="down" className="table-status-dropdown-icon" />
                  </a>
                </Dropdown>
              </span>
            </div>
          );
        },
      },
      {
        title: "Review Deadlines",
        key: "review_deadlines",
        dataIndex: "review_deadlines",
        sortField: "review_deadlines",
        sorter: true,
        render: (text) => {
          let interim = text && text["interim"];
          interim =
            !interim || interim === Strings.REVIEW_DEADLINE_NOT_APPLICABLE
              ? "N/A"
              : interim === Strings.REVIEW_DEADLINE_PAID
              ? "Paid"
              : `${interim} days`;
          let final = text && text["final"];
          final =
            !final || final === Strings.REVIEW_DEADLINE_NOT_APPLICABLE
              ? "N/A"
              : final === Strings.REVIEW_DEADLINE_PAID
              ? "Paid"
              : `${final} days`;
          return (
            <div title="Review Deadlines">
              <Row>
                <Col span={10} style={{ textAlign: "right" }}>
                  {interim}
                </Col>
                <Col span={4} style={{ textAlign: "center" }}>
                  <Divider type="vertical" style={{ width: 2 }} />
                </Col>
                <Col span={10} style={{ textAlign: "left" }}>
                  {final}
                </Col>
              </Row>
            </div>
          );
        },
      },
      {
        key: "operations",
        render: (text, record) => (
          <div style={{ float: "right" }}>
            <Button type="link" onClick={() => {}}>
              <Icon type="form" className="icon-lg" />
            </Button>
          </div>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled:
          record &&
          ((this.state.selectedApplicationId &&
            record.application_id !== this.state.selectedApplicationId) ||
            (record.interim_payment_status_code !== "APPROVED" &&
              record.final_payment_status_code !== "APPROVED")),
        className:
          record && (record.has_interim_prfs || record.has_final_prfs)
            ? "approved-work-has-prf-checkbox"
            : "",
      }),
    };

    return (
      <>
        <Table
          columns={applySortIndicator(columns, this.props.params)}
          pagination={false}
          rowSelection={rowSelection}
          rowKey={(record) => record.work_id}
          dataSource={this.transformRowData(this.props.applicationsApprovedContractedWork)}
          onChange={handleTableChange(this.props.handleTableChange, this.props.params)}
          className="table-headers-center"
          loading={{
            spinning: !this.props.isLoaded,
            delay: 500,
          }}
        />
        <br />
        {!isEmpty(this.props.applicationsApprovedContractedWork) && (
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

ApprovedContractedWorkPaymentTable.propTypes = propTypes;
ApprovedContractedWorkPaymentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  filterListContractedWorkPaymentStatusOptions: getFilterListContractedWorkPaymentStatusOptions(
    state
  ),
  filterListContractedWorkTypeOptions: getFilterListContractedWorkTypeOptions(state),
  contractedWorkPaymentStatusDropdownOptions: getDropdownContractedWorkPaymentStatusOptions(state),
});

export default connect(mapStateToProps)(ApprovedContractedWorkPaymentTable);
