import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty, startCase, camelCase } from "lodash";
import { Table, Icon, Tooltip, Pagination, Menu, Dropdown, Input, Button, Popover } from "antd";
import { formatDateTime, formatDate, formatMoney, formatDateTimeFine } from "@/utils/helpers";
import { getFilterListApplicationStatusOptions } from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applicationsApprovedContractedWork: PropTypes.any.isRequired,
  filterListApplicationStatusOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  handleContractedWorkPaymentStatusChange: PropTypes.func.isRequired,
  contractedWorkPaymentStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
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

export const toolTip = (title, extraClassName) => (
  <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Tooltip>
);

const popover = (message, extraClassName) => (
  <Popover title="Admin Note" content={message}>
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Popover>
);

export class ApprovedContractedWorkPaymentTable extends Component {
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
          let daysLeftCount =
            daysToSubmit -
            (moment() - moment(interim_payment_submission_date)) / (1000 * 60 * 60 * 24);
          daysLeftCount = Math.round(daysLeftCount);
          interim_report_days_until_deadline = daysLeftCount;
        }
      }
      return {
        ...work,
        key: work.work_id,
        // contracted_work_type: startCase(camelCase(work.contracted_work_type)),
        interim_cost: parseFloat(contracted_work_payment.interim_actual_cost),
        final_cost: parseFloat(contracted_work_payment.final_actual_cost),
        interim_payment_status_code:
          (contracted_work_payment.interim_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.interim_payment_status_code
            ]) ||
          "Information Required",
        final_payment_status_code:
          (contracted_work_payment.final_payment_status_code &&
            this.props.contractedWorkPaymentStatusOptionsHash[
              contracted_work_payment.final_payment_status_code
            ]) ||
          "Information Required",
        interim_eoc: contracted_work_payment.interim_eoc_application_document_guid,
        final_eoc: contracted_work_payment.final_eoc_application_document_guid,
        interim_report_days_until_deadline,
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

  columnSearchInput = (setSelectedKeys, selectedKeys, clearFilters, dataIndex, placeholder) => {
    return (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {}}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
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
        key: "application_id",
        dataIndex: "application_id",
        sortField: "application_id",
        sorter: true,
        render: (text) => <div title="Application ID">{text}</div>,
      },
      {
        title: "Work ID",
        key: "work_id",
        dataIndex: "work_id",
        sortField: "work_id",
        sorter: true,
        render: (text) => <div title="Work ID">{text}</div>,
      },
      {
        title: "Well Auth No.",
        key: "well_authorization_number",
        dataIndex: "well_authorization_number",
        sortField: "well_authorization_number",
        sorter: true,
        render: (text) => <div title="Well Auth No.">{text}</div>,
      },
      {
        title: "Work Type",
        key: "contracted_work_type",
        dataIndex: "contracted_work_type",
        sortField: "contracted_work_type",
        sorter: true,
        render: (text) => <div title="Work Type">{startCase(camelCase(text))}</div>,
      },
      {
        title: "Est. Cost",
        key: "contracted_work_total",
        dataIndex: "contracted_work_total",
        render: (text) => <div title="Est. Cost">{formatMoney(text) || Strings.DASH}</div>,
      },
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
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.interim_payment_status
              ? record.contracted_work_payment.interim_payment_status.note
              : null;
          return (
            <div title="Interim Status">
              {note && popover(note, "table-record-tooltip")}
              {text}
            </div>
          );
        },
      },
      {
        title: "Progress Report Status",
        key: "interim_report_days_until_deadline",
        dataIndex: "interim_report_days_until_deadline",
        sortField: "interim_report_days_until_deadline",
        sorter: false,
        render: (text) => {
          let display = null;
          if (text === -Infinity) {
            display = "Submitted";
          } else if (text === Infinity) {
            display = Strings.DASH;
          } else {
            display = `${text} days to submit`;
          }
          return <div title="Progress Report Status">{display}</div>;
        },
      },
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
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.final_payment_status
              ? record.contracted_work_payment.final_payment_status.note
              : null;
          return (
            <div title="Final Status">
              {note && popover(note, "table-record-tooltip")}
              {text}
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

    return (
      <>
        <Table
          columns={applySortIndicator(columns, this.props.params)}
          pagination={false}
          dataSource={this.transformRowData(this.props.applicationsApprovedContractedWork)}
          onChange={handleTableChange(this.props.handleTableChange, this.props.params)}
          className="table-headers-center"
          loading={!this.props.isLoaded}
        />
        <br />
        {!isEmpty(this.props.applicationsApprovedContractedWork) && (
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

ApprovedContractedWorkPaymentTable.propTypes = propTypes;
ApprovedContractedWorkPaymentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  filterListApplicationStatusOptions: getFilterListApplicationStatusOptions(state),
});

export default connect(mapStateToProps)(ApprovedContractedWorkPaymentTable);
