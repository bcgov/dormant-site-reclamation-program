import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { getApplications, getWorkTypes, getPageData } from "@/selectors/applicationSelectors";
import { fetchApplications, updateApplication } from "@/actionCreators/applicationActionCreator";
import {
  getApplicationStatusOptionsHash,
  getDropdownApplicationStatusOptions,
  getApplicationStatusOptions,
} from "@/selectors/staticContentSelectors";
import ApplicationTable from "@/components/admin/ApplicationTable";

const propTypes = {
  applications: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
};
export class ReviewApplicationInfo extends Component {
  componentDidMount() {
    this.props.fetchApplications();
  }

  handleApplicationStatusChange = (e, application) => {
    console.log(application);
    console.log(e.key);
    const payload = {
      application_status_code: "UNDER_REVIEW",
      ...application,
    };
    this.props.updateApplication(application.guid, payload).then(() => {
      this.props.fetchApplications();
    });
  };

  render() {
    console.log(this.props.applicationStatusOptions);
    return (
      <>
        <ApplicationTable
          applications={this.props.applications}
          workTypes={this.props.workTypes}
          pageData={this.props.pageData}
          fetchApplications={this.props.fetchApplications}
          applicationStatusOptions={this.props.applicationStatusOptions}
          applicationStatusOptionsHash={this.props.applicationStatusOptionsHash}
          handleApplicationStatusChange={this.handleApplicationStatusChange}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
  workTypes: getWorkTypes(state),
  pageData: getPageData(state),
  applicationStatusOptions: getDropdownApplicationStatusOptions(state),
  applicationStatusOptionsHash: getApplicationStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
      updateApplication,
    },
    dispatch
  );

ReviewApplicationInfo.propTypes = propTypes;
// ReviewApplicationInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReviewApplicationInfo);
