import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Icon, Row, Col, Dropdown, Menu } from "antd";
import { withRouter } from "react-router-dom";
import { isEmpty, startCase, camelCase } from "lodash";
import { bindActionCreators, compose } from "redux";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";
import {
  getApplicationsApprovedContractedWork,
  getPageData,
} from "@/selectors/applicationSelectors";
import {
  fetchApplicationApprovedContractedWork,
  createContractedWorkPaymentStatus,
  createApplicationPaymentDocument,
} from "@/actionCreators/applicationActionCreator";
import {
  getDropdownContractedWorkPaymentStatusOptions,
  getContractedWorkPaymentStatusOptionsHash,
} from "@/selectors/staticContentSelectors";
import ApprovedContractedWorkPaymentTable from "@/components/admin/ApprovedContractedWorkPaymentTable";
import { modalConfig } from "@/components/modalContent/config";
import JumpToApplicationForm from "@/components/forms/JumpToApplicationForm";

const propTypes = {
  applicationsApprovedContractedWork: PropTypes.any.isRequired,
  pageData: PropTypes.any.isRequired,
  fetchApplicationApprovedContractedWork: PropTypes.func.isRequired,
  createContractedWorkPaymentStatus: PropTypes.func.isRequired,
  createApplicationPaymentDocument: PropTypes.func.isRequired,
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
  application_guid: undefined,
  company_name: undefined,
  work_id: undefined,
  well_authorization_number: undefined,
  contracted_work_type: [],
  interim_payment_status_code: [],
  final_payment_status_code: [],
};

export class ReviewApprovedContractedWorkInfo extends Component {
  state = { isLoaded: false, params: defaultParams, selectedRows: [] };

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
        params: { ...params, page: defaultParams["page"] },
      },
      () =>
        this.props.history.replace(
          routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(this.state.params)
        )
    );
  };

  onSelectedRowsChanged = (selectedRows) => {
    this.setState({ selectedRows });
  };

  openUpdateContractedWorkPaymentStatusModal = (status, record, type) => {
    if (status === "READY_FOR_REVIEW") {
      return this.handleContractedWorkPaymentStatusChange(record, {
        contracted_work_payment_status_code: status,
        contracted_work_payment_code: type,
      });
    }
    return this.props.openModal({
      width: 1000,
      props: {
        title: `Update ${startCase(camelCase(type))} Payment Status for Work ID ${record.work_id}`,
        contractedWorkPaymentStatusOptionsHash: this.props.contractedWorkPaymentStatusOptionsHash,
        contractedWorkPaymentStatus: status,
        contractedWorkPaymentType: type,
        contractedWork: record,
        onSubmit: this.handleContractedWorkPaymentStatusChange,
      },
      content: modalConfig.ADMIN_UPDATE_CONTRACTED_WORK_PAYMENT_STATUS,
    });
  };

  handleContractedWorkPaymentStatusChange = (record, payload) =>
    this.props
      .createContractedWorkPaymentStatus(record.application_guid, record.work_id, payload)
      .then(() => {
        this.props.closeModal();
        this.setState({
          isLoaded: false,
        });
        this.props
          .fetchApplicationApprovedContractedWork(this.state.params)
          .then(() => this.setState({ isLoaded: true }));
      });

  handleContractedWorkPaymentInterimStatusChange = (status, record) =>
    this.openUpdateContractedWorkPaymentStatusModal(status, record, "INTERIM");

  handleContractedWorkPaymentFinalStatusChange = (status, record) =>
    this.openUpdateContractedWorkPaymentStatusModal(status, record, "FINAL");

  handleCreatePaymentRequestForm = ({ key }) => {
    const paymentDocumentCode = key;

    let contractedWork = this.state.selectedRows;
    if (paymentDocumentCode === "INTERIM_PRF") {
      contractedWork = contractedWork.filter(
        (work) => work.interim_payment_status_code === "APPROVED"
      );
    } else if (paymentDocumentCode === "FINAL_PRF") {
      contractedWork = contractedWork.filter(
        (work) => work.final_payment_status_code === "APPROVED"
      );
    } else {
      throw new Error("Unknown payment document code received!");
    }

    const applicationGuid = contractedWork[0].application_guid;
    const workIds = contractedWork.reduce((list, work) => [...list, work.work_id], []);
    const payload = { work_ids: workIds, payment_document_code: paymentDocumentCode };

    this.props.createApplicationPaymentDocument(applicationGuid, payload).then(() => {
      this.setState({ isLoaded: false });
      this.props
        .fetchApplicationApprovedContractedWork(this.state.params)
        .then(() => this.setState({ isLoaded: true }));
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
      () =>
        this.props.history.replace(
          routes.REVIEW_APPROVED_CONTRACTED_WORK.dynamicRoute(this.state.params)
        )
    );
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

  handleApplicationGuidSearch = (values) => {
    const params = { ...this.state.params, application_guid: values.guid };
    this.handleTableChange(params);
  };

  render() {
    const interimPrfRows = this.state.selectedRows.filter(
      (work) => work.interim_payment_status_code === "APPROVED"
    );
    const canCreateInterimPrf = !isEmpty(interimPrfRows);

    const finalPrfRows = this.state.selectedRows.filter(
      (work) => work.final_payment_status_code === "APPROVED"
    );
    const canCreateFinalPrf = !isEmpty(finalPrfRows);

    const selectedTotal = this.state.selectedRows.length;

    const menu = (
      <Menu onClick={this.handleCreatePaymentRequestForm}>
        <Menu.Item key="INTERIM_PRF" disabled={!canCreateInterimPrf}>
          Interim PRF ({interimPrfRows.length}/{selectedTotal} items)
        </Menu.Item>
        <Menu.Item key="FINAL_PRF" disabled={!canCreateFinalPrf}>
          Final PRF ({finalPrfRows.length}/{selectedTotal} items)
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        <Row>
          <Col>
            <JumpToApplicationForm
              onSubmit={this.handleApplicationGuidSearch}
              initialValues={{ guid: this.state.params.application_guid }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Dropdown
              overlay={menu}
              style={{ display: "inline" }}
              disabled={!canCreateInterimPrf && !canCreateFinalPrf}
            >
              <Button type="link">
                <Icon type="file" className="icon-lg" />
                Create PRF <Icon type="down" />
              </Button>
            </Dropdown>
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
              onSelectedRowsChanged={this.onSelectedRowsChanged}
              onPageChange={this.onPageChange}
              isLoaded={this.state.isLoaded}
              contractedWorkPaymentStatusDropdownOptions={
                this.props.contractedWorkPaymentStatusDropdownOptions
              }
              contractedWorkPaymentStatusOptionsHash={
                this.props.contractedWorkPaymentStatusOptionsHash
              }
              handleContractedWorkPaymentInterimStatusChange={
                this.handleContractedWorkPaymentInterimStatusChange
              }
              handleContractedWorkPaymentFinalStatusChange={
                this.handleContractedWorkPaymentFinalStatusChange
              }
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
      createContractedWorkPaymentStatus,
      createApplicationPaymentDocument,
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
