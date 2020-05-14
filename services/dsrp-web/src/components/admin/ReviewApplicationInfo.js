/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Table, Icon } from "antd";
import { getApplications } from "@/selectors/applicationSelectors";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import { formatDateTime } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";

const propTypes = {
  applications: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
};

const columns = [
  {
    title: "Application ID",
    dataIndex: "id",
    render: (text) => <div title="id">{text || Strings.DASH}</div>,
  },
  {
    title: "Company",
    dataIndex: "company_name",
    render: (text) => <div title="Company">{text || Strings.DASH}</div>,
  },
  {
    title: "Received On",
    dataIndex: "submission_date",
    sortField: "submission_date",
    sorter: true,
    render: (text) => <div title="Received On">{formatDateTime(text)}</div>,
  },
  {
    title: "Permit Holder",
    dataIndex: "permit_holder",
    render: (text) => <div title="Permit Holder">{text || Strings.DASH}</div>,
  },
  {
    title: "No. of Well Sites",
    dataIndex: "wells",
    render: (text) => <div title="No. of Well Sites">{text || Strings.DASH}</div>,
  },
  {
    title: "No. of Work Types",
    dataIndex: "cost",
    render: (text) => <div title="No. of Work Types">{text || Strings.DASH}</div>,
  },
  {
    title: "Total Est. Cost",
    dataIndex: "amount",
    render: (text) => <div title="Total Est. Cost">{text || Strings.DASH}</div>,
  },
  {
    title: "Est. Shared Cost",
    dataIndex: "payment",
    render: (text) => <div title="Est. Shared Cost">{text || Strings.DASH}</div>,
  },
  {
    title: "Status",
    dataIndex: "application_status_code",
    render: (text) => <div title="Est. Shared Cost">{text || Strings.DASH}</div>,
  },
  {
    title: "",
    key: "",
    dataIndex: "",
    sortField: "",
    render: (text, record) => (
      <div title="View">
        <Link to={route.VIEW_APPLICATION.dynamicRoute(record.key)}>
          {" "}
          <Icon type="eye" />
        </Link>
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
