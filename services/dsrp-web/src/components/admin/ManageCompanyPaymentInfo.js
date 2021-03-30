import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Icon, Row, Col, Dropdown, Menu } from "antd";
import { withRouter } from "react-router-dom";
import { isEmpty } from "lodash";
import { bindActionCreators, compose } from "redux";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import * as routes from "@/constants/routes";
import * as Strings from "@/constants/strings";

import { getCompanyPaymentInfos } from "@/selectors/companyPaymentInfoSelectors"
import { createCompanyPaymentInfo, updateCompanyPaymentInfo, fetchCompanyPaymentInfos } from "@/actionCreators/companyPaymentInfoActionCreator"

import { CompanyPaymentInfoTable } from "@/components/admin/CompanyPaymentInfoTable";

const propTypes = {
  fetchCompanyPaymentInfos: PropTypes.any.isRequired,
  createCompanyPaymentInfo: PropTypes.any.isRequired,
  updateCompanyPaymentInfo: PropTypes.any.isRequired,
  getCompanyPaymentInfos: PropTypes.any.isRequired,
  pageData: PropTypes.any.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE_NUMBER,
  per_page: Strings.DEFAULT_PAGE_SIZE,
  company_name: undefined,
  company_address: undefined,
  po_number: undefined,
  qualified_receiver_name: undefined,
  expense_authority_name: undefined,
  sort_field: "company_name",
  sort_dir: "asc",
};

export class ManageCompanyPaymentInfo extends Component {
  state = {
    isLoaded: false,
    params: defaultParams,
  };

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: parsedParams,
        isLoaded: false,
      },
      () =>
        this.props.fetchCompanyPaymentInfos(this.state.params).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  onPageChange = (page, per_page) => {
    this.props.history.replace(
      routes.COMPANY_PAYMENT_INFO.dynamicRoute({ ...this.state.params, page, per_page })
    );
  };

  handleRefresh = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(
      routes.COMPANY_PAYMENT_INFO.dynamicRoute(this.state.params)
    );
  };

  handleReset = () => {
    if (!this.state.isLoaded) {
      return;
    }
    this.props.history.replace(routes.COMPANY_PAYMENT_INFO.dynamicRoute(defaultParams));
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
          routes.COMPANY_PAYMENT_INFO.dynamicRoute(this.state.params)
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

  handleUpdateCompanyPaymentInfo = (payload) => 
    this.props.updateCompanyPaymentInfo(payload.company_name, payload).then(() => {
      this.props.closeModal();
      this.setState({
        isLoaded: false,
      });
      this.props
        .fetchCompanyPaymentInfos(this.state.params)
        .then(() => this.setState({ isLoaded: true }));
    });

  handleCreateCompanyPaymentInfo = (payload) =>
    this.props.createCompanyPaymentInfo(payload).then(() => {
      this.props.closeModal();
      this.setState({
        isLoaded: false,
      });
      this.props
        .fetchCompanyPaymentInfos(this.state.params)
        .then(() => this.setState({ isLoaded: true }));
    });

  render() {
    return (
      <>
        <Row>
          <Col>
            <CompanyPaymentInfoTable
              params={this.state.params}
              onPageChange={this.onPageChange}
              isLoaded={this.state.isLoaded}
              pageData={this.props.pageData}
              openModal={this.props.openModal}
              closeModal={this.props.closeModal}
              handleUpdateCompanyPaymentInfo={this.handleUpdateCompanyPaymentInfo}
              handleCreateCompanyPaymentInfo={this.handleCreateCompanyPaymentInfo}
            />
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  pageData: getCompanyPaymentInfos(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getCompanyPaymentInfos,
      createCompanyPaymentInfo,
      updateCompanyPaymentInfo,
      fetchCompanyPaymentInfos,
      openModal,
      closeModal,
    },
    dispatch
  );

ManageCompanyPaymentInfo.propTypes = propTypes;
ManageCompanyPaymentInfo.defaultProps = defaultProps;

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ManageCompanyPaymentInfo);
