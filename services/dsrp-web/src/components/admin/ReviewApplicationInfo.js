/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Table } from "antd";
import { getApplications } from "@/selectors/applicationSelectors";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import { formatDateTime, dateSorter, nullableStringSorter } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applications: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
};

const columns = [
  {
    title: "Company Name",
    dataIndex: "company_name",
    render: (text) => <div title="company_name">{text || Strings.DASH}</div>,
  },
  {
    title: "Permit Holder",
    dataIndex: "permit_holder",
  },
  {
    title: "No. Wells",
    dataIndex: "wells",
  },
  {
    title: "Estimated Cost",
    dataIndex: "cost",
  },
  {
    title: "Eligable amount",
    dataIndex: "amount",
  },
  {
    title: "Total 10% Payment",
    dataIndex: "payment",
  },
  {
    title: "Submission Date",
    dataIndex: "submission_date",
    sortField: "submission_date",
    sorter: true,
    render: (text) => <div title="submission_date">{formatDateTime(text)}</div>,
  },
  {
    title: "View",
    key: "",
    dataIndex: "",
    sortField: "",
    render: (text, record) => (
      <div title="View">
        <Link to={route.VIEW_APPLICATION.dynamicRoute(record.key)}>View</Link>
      </div>
    ),
  },
];

export class ReviewApplicationInfo extends Component {
  componentDidMount() {
    this.props.fetchApplications();
  }

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

const mapStateToProps = (state) => ({
  applications: getApplications(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
    },
    dispatch
  );

ReviewApplicationInfo.propTypes = propTypes;
// ReviewApplicationInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReviewApplicationInfo);
