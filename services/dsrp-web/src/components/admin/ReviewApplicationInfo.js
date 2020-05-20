import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { getApplications, getWorkTypes, getPageData } from "@/selectors/applicationSelectors";
import {
  fetchApplications,
  updateApplication,
  updateApplicationReview,
} from "@/actionCreators/applicationActionCreator";
import {
  getDropdownApplicationStatusOptions,
  getApplicationStatusOptionsHash,
  getDropdownContractedWorkStatusOptions,
  getContractedWorkStatusOptions,
} from "@/selectors/staticContentSelectors";
import ApplicationTable from "@/components/admin/ApplicationTable";

const propTypes = {
  applications: PropTypes.any.isRequired,
  workTypes: PropTypes.any.isRequired,
  pageData: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
  updateApplication: PropTypes.func.isRequired,
  updateApplicationReview: PropTypes.func.isRequired,
  applicationStatusDropdownOptions: PropTypes.any.isRequired,
  applicationStatusOptionsHash: PropTypes.any.isRequired,
  contractedWorkStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkStatusOptionsHash: PropTypes.any.isRequired,
};

const defaultProps = {};

export class ReviewApplicationInfo extends Component {
  componentDidMount() {
    this.props.fetchApplications();
  }

  handleApplicationStatusChange = (value, application) => {
    const payload = {
      ...application,
      application_status_code: value.key,
    };
    this.props.updateApplication(application.guid, payload).then(() => {
      this.props.fetchApplications();
    });
  };

  handleContractedWorkStatusChange = (value, application) => {
    console.log("value", value);
    console.log("application", application);
    // const payload = {
    //   ...application,
    //   application_status_code: value.key,
    // };
    return;
    this.props.updateApplicationReview(application.guid, payload).then(() => {
      this.props.fetchApplications();
    });
  };

  render() {
    return (
      <ApplicationTable
        applications={this.props.applications}
        workTypes={this.props.workTypes}
        pageData={this.props.pageData}
        fetchApplications={this.props.fetchApplications}
        applicationStatusDropdownOptions={this.props.applicationStatusDropdownOptions}
        applicationStatusOptionsHash={this.props.applicationStatusOptionsHash}
        contractedWorkStatusDropdownOptions={this.props.contractedWorkStatusDropdownOptions}
        contractedWorkStatusOptionsHash={this.props.contractedWorkStatusOptionsHash}
        handleApplicationStatusChange={this.handleApplicationStatusChange}
        handleContractedWorkStatusChange={this.handleContractedWorkStatusChange}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
  workTypes: getWorkTypes(state),
  pageData: getPageData(state),
  applicationStatusDropdownOptions: getDropdownApplicationStatusOptions(state),
  applicationStatusOptionsHash: getApplicationStatusOptionsHash(state),
  contractedWorkStatusDropdownOptions: getDropdownContractedWorkStatusOptions(state),
  contractedWorkStatusOptionsHash: getContractedWorkStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
      updateApplication,
      updateApplicationReview,
    },
    dispatch
  );

ReviewApplicationInfo.propTypes = propTypes;
ReviewApplicationInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReviewApplicationInfo);
