import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { set, isEmpty } from "lodash";
import {
  getApplications,
  getApplicationsWellSitesContractedWork,
  getPageData,
} from "@/selectors/applicationSelectors";
import {
  fetchApplications,
  updateApplication,
  updateApplicationReview,
} from "@/actionCreators/applicationActionCreator";
import {
  getDropdownApplicationStatusOptions,
  getApplicationStatusOptionsHash,
  getDropdownContractedWorkStatusOptions,
  getContractedWorkStatusOptionsHash,
} from "@/selectors/staticContentSelectors";
import ApplicationTable from "@/components/admin/ApplicationTable";

const propTypes = {
  applications: PropTypes.any.isRequired,
  applicationsWellSitesContractedWork: PropTypes.any.isRequired,
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

  handleApplicationStatusChange = (item, application) => {
    const payload = {
      ...application,
      application_status_code: item.key,
    };

    this.props.updateApplication(application.guid, payload).then(() => {
      this.props.fetchApplications();
    });
  };

  handleContractedWorkStatusChange = (item, contractedWork) => {
    const reviewJson = contractedWork.review_json || {};

    // NOTE: Manually doing this here because using set() thinks integers are array indexes (well_authorization_number).
    if (isEmpty(reviewJson.well_sites)) {
      reviewJson.well_sites = {};
    }
    if (isEmpty(reviewJson.well_sites[contractedWork.well_authorization_number])) {
      reviewJson.well_sites[contractedWork.well_authorization_number] = {};
    }

    set(
      reviewJson.well_sites[contractedWork.well_authorization_number],
      `contracted_work.${contractedWork.contracted_work_type}.contracted_work_status_code`,
      item.key
    );

    const payload = {
      review_json: reviewJson,
    };

    this.props.updateApplicationReview(contractedWork.application_guid, payload).then(() => {
      this.props.fetchApplications();
    });
  };

  render() {
    return (
      <ApplicationTable
        applications={this.props.applications}
        applicationsWellSitesContractedWork={this.props.applicationsWellSitesContractedWork}
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
  applicationsWellSitesContractedWork: getApplicationsWellSitesContractedWork(state),
  pageData: getPageData(state),
  applicationStatusDropdownOptions: getDropdownApplicationStatusOptions(state),
  applicationStatusOptionsHash: getApplicationStatusOptionsHash(state),
  contractedWorkStatusDropdownOptions: getDropdownContractedWorkStatusOptions(state),
  contractedWorkStatusOptionsHash: getContractedWorkStatusOptionsHash(state),
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
