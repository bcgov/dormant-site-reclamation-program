import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Icon, Row, Col } from "antd";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";
import {
  getApplicationsApprovedContractedWork,
  getPageData,
} from "@/selectors/applicationSelectors";
import { fetchApplicationApprovedContractedWork } from "@/actionCreators/applicationActionCreator";
import {
  getDropdownContractedWorkPaymentStatusOptions,
  getContractedWorkPaymentStatusOptionsHash,
} from "@/selectors/staticContentSelectors";
import ApprovedContractedWorkPaymentTable from "@/components/admin/ApprovedContractedWorkPaymentTable";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  applicationsApprovedContractedWork: PropTypes.any.isRequired,
  pageData: PropTypes.any.isRequired,
  fetchApplicationApprovedContractedWork: PropTypes.func.isRequired,
  contractedWorkPaymentStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
};

const defaultProps = {};

const defaultParams = {
  page: Strings.DEFAULT_PAGE_NUMBER,
  per_page: Strings.DEFAULT_PAGE_SIZE,
  sort_field: "review_deadlines",
  sort_dir: "asc",
  application_id: undefined,
  work_id: undefined,
  well_authorization_number: undefined,
  contracted_work_type: [],
  interim_payment_status_code: [],
  final_payment_status_code: [],
};

export class ReviewApprovedContractedWorkInfo extends Component {
  state = { isLoaded: false, params: defaultParams };

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: parsedParams,
        isLoaded: false,
      },
      () =>
        this.props.fetchApplicationApprovedContractedWork(this.state.params).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  onPageChange = (page, per_page) => {
    this.props.history.replace(
      routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute({ ...this.state.params, page, per_page })
    );
  };

  handleRefresh = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(
      routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(this.state.params)
    );
  };

  handleReset = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(defaultParams));
  };

  handleTableChange = (params) => {
    this.setState(
      {
        params,
      },
      () =>
        this.props.history.replace(
          routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(this.state.params)
        )
    );
  };

  openUpdateContractedWorkPaymentStatusModal = (item, record) => {
    // this.props.openModal({
    //   props: {
    //     title: `Update Contracted Work Payment Status`,
    //     status: item.key,
    //     contractedWorkPayment: record,
    //     onSubmit: this.handleContractedWorkPaymentStatusChange,
    //   },
    //   content: modalConfig.FOO,
    // });
  };

  handleContractedWorkPaymentStatusChange = () => {};

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      {
        params: {
          ...defaultParams,
          ...params,
        },
      },
      () =>
        this.props.history.replace(
          routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(this.state.params)
        )
    );
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
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
        <Row>
          <Col>
            <div style={{ float: "right" }}>
              <Button type="link" onClick={this.handleReset}>
                <Icon type="delete" className="icon-lg" />
                Clear Filters
              </Button>
              <Button type="link" onClick={this.handleRefresh}>
                <Icon type="reload" className="icon-lg" />
                Refresh
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <ApprovedContractedWorkPaymentTable
              applicationsApprovedContractedWork={this.props.applicationsApprovedContractedWork}
              pageData={this.props.pageData}
              params={this.state.params}
              handleTableChange={this.handleTableChange}
              onPageChange={this.onPageChange}
              isLoaded={this.state.isLoaded}
              contractedWorkPaymentStatusDropdownOptions={
                this.props.contractedWorkPaymentStatusDropdownOptions
              }
              contractedWorkPaymentStatusOptionsHash={
                this.props.contractedWorkPaymentStatusOptionsHash
              }
              handleContractedWorkPaymentStatusChange={this.handleContractedWorkPaymentStatusChange}
            />
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  applicationsApprovedContractedWork: getApplicationsApprovedContractedWork(state),
  pageData: getPageData(state),
  contractedWorkPaymentStatusDropdownOptions: getDropdownContractedWorkPaymentStatusOptions(state),
  contractedWorkPaymentStatusOptionsHash: getContractedWorkPaymentStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationApprovedContractedWork,
      openModal,
      closeModal,
    },
    dispatch
  );

ReviewApprovedContractedWorkInfo.propTypes = propTypes;
ReviewApprovedContractedWorkInfo.defaultProps = defaultProps;

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ReviewApprovedContractedWorkInfo);
