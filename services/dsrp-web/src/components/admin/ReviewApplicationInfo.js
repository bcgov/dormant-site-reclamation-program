import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Icon } from "antd";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { set, isEmpty } from "lodash";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";
import {
  getApplications,
  getApplicationsWellSitesContractedWork,
  getPageData,
} from "@/selectors/applicationSelectors";
import {
  fetchApplications,
  updateApplicationReview,
  createApplicationStatus,
} from "@/actionCreators/applicationActionCreator";
import {
  getDropdownApplicationStatusOptions,
  getApplicationStatusOptionsHash,
  getDropdownContractedWorkStatusOptions,
  getContractedWorkStatusOptionsHash,
} from "@/selectors/staticContentSelectors";
import { getPermitHoldersHash } from "@/selectors/OGCSelectors";
import {
  fetchLiabilities,
  fetchWells,
  fetchPermitHolders,
} from "@/actionCreators/OGCActionCreator";
import ApplicationTable from "@/components/admin/ApplicationTable";
import JumpToApplicationForm from "@/components/forms/JumpToApplicationForm";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  applications: PropTypes.any.isRequired,
  applicationsWellSitesContractedWork: PropTypes.any.isRequired,
  pageData: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
  updateApplicationReview: PropTypes.func.isRequired,
  applicationStatusDropdownOptions: PropTypes.any.isRequired,
  applicationStatusOptionsHash: PropTypes.any.isRequired,
  contractedWorkStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkStatusOptionsHash: PropTypes.any.isRequired,
};

const defaultProps = {};

const defaultParams = {
  page: Strings.DEFAULT_PAGE_NUMBER,
  per_page: Strings.DEFAULT_PAGE_SIZE,
  sort_field: "submission_date",
  sort_dir: "asc",
  id: undefined,
  guid: undefined,
  company_name: undefined,
  application_status_code: [],
};

export class ReviewApplicationInfo extends Component {
  state = { isLoaded: false, params: defaultParams };

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: parsedParams,
        isLoaded: false,
      },
      () =>
        this.props.fetchApplications(this.state.params).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  onPageChange = (page, per_page) => {
    this.props.history.replace(
      routes.REVIEW_APPLICATIONS.dynamicRoute({ ...this.state.params, page, per_page })
    );
  };

  search = (values) => {
    const params = { ...defaultParams, guid: values.guid };
    this.setState(
      {
        params,
      },
      () => this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(this.state.params))
    );
  };

  handleReset = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(defaultParams));
  };

  handleRefresh = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(this.state.params));
  };

  handleApplicationsSearch = (params) => {
    this.setState(
      {
        params,
      },
      () => this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(this.state.params))
    );
  };

  handleApplicationStatusChange = (guid, payload) => {
    return this.props.createApplicationStatus(guid, payload).then(() => {
      this.props.fetchApplications(this.state.params);
      this.props.closeModal();
    });
  };

  openUpdateStatusModal = (item, record) => {
    this.props.openModal({
      props: {
        title: `Update Status of ${record.company_name} to: ${
          this.props.applicationStatusOptionsHash[item.key]
        }`,
        status: item.key,
        application: record,
        onSubmit: this.handleApplicationStatusChange,
      },
      content: modalConfig.UPDATE_APPLICATION_STATUS,
    });
  };

  handleContractedWorkStatusChange = (item, contractedWork) => {
    const reviewJson = contractedWork.review_json || { well_sites: [] };

    // NOTE: Manually doing this here because using set() thinks integers are array indexes (well_authorization_number).
    // if (isEmpty(reviewJson.well_sites)) {
    //   reviewJson.well_sites = [];
    // }

    if (isEmpty(reviewJson.well_sites[contractedWork.well_index])) {
      reviewJson.well_sites[contractedWork.well_index] = {};
    }

    if (
      isEmpty(
        reviewJson.well_sites[contractedWork.well_index][contractedWork.well_authorization_number]
      )
    ) {
      reviewJson.well_sites[contractedWork.well_index][
        contractedWork.well_authorization_number
      ] = {};
    }

    set(
      reviewJson.well_sites[contractedWork.well_index][contractedWork.well_authorization_number],
      `contracted_work.${contractedWork.contracted_work_type}.contracted_work_status_code`,
      item.key
    );

    const payload = {
      review_json: reviewJson,
    };
    this.props.updateApplicationReview(contractedWork.application_guid, payload).then(() => {
      this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(this.state.params));
    });
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      {
        params: {
          ...defaultParams,
          ...params,
        },
      },
      () => this.props.history.replace(routes.REVIEW_APPLICATIONS.dynamicRoute(this.state.params))
    );
    this.props.fetchPermitHolders();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      if (nextProps.location.search) {
        this.renderDataFromURL(nextProps.location.search);
      } else {
        this.renderDataFromURL(queryString.stringify(defaultParams));
      }
    }
  }

  render() {
    return (
      <>
        <div style={{ float: "right", marginTop: 70 }}>
          <Button type="link" onClick={this.handleReset}>
            <Icon type="delete" className="icon-lg" />
            Clear Filters
          </Button>
          <Button type="link" onClick={this.handleRefresh}>
            <Icon type="reload" className="icon-lg" />
            Refresh
          </Button>
        </div>
        <JumpToApplicationForm
          onSubmit={this.search}
          initialValues={{ guid: this.state.params.guid }}
        />
        <ApplicationTable
          applications={this.props.applications}
          applicationsWellSitesContractedWork={this.props.applicationsWellSitesContractedWork}
          pageData={this.props.pageData}
          params={this.state.params}
          handleTableChange={this.handleApplicationsSearch}
          onPageChange={this.onPageChange}
          isLoaded={this.state.isLoaded}
          applicationStatusDropdownOptions={this.props.applicationStatusDropdownOptions}
          applicationStatusOptionsHash={this.props.applicationStatusOptionsHash}
          contractedWorkStatusDropdownOptions={this.props.contractedWorkStatusDropdownOptions}
          contractedWorkStatusOptionsHash={this.props.contractedWorkStatusOptionsHash}
          handleApplicationStatusChange={this.openUpdateStatusModal}
          handleContractedWorkStatusChange={this.handleContractedWorkStatusChange}
          permitHoldersHash={this.props.permitHoldersHash}
          fetchLiabilities={this.props.fetchLiabilities}
          fetchWells={this.props.fetchWells}
        />
      </>
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
  permitHoldersHash: getPermitHoldersHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
      updateApplicationReview,
      fetchLiabilities,
      fetchWells,
      fetchPermitHolders,
      createApplicationStatus,
      openModal,
      closeModal,
    },
    dispatch
  );

ReviewApplicationInfo.propTypes = propTypes;
ReviewApplicationInfo.defaultProps = defaultProps;

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ReviewApplicationInfo);
