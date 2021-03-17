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

const propTypes = {

};

const defaultProps = {};

const defaultParams = {

};

export class ManageCompanyPaymentInfo extends Component {
  state = {
    isLoaded: false,
    params: defaultParams,
  };

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);

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

  render() {
    return (
      <>
      <div>
        Test
      </div>
      </>
    );
  }
}

  ManageCompanyPaymentInfo.propTypes = propTypes;
ManageCompanyPaymentInfo.defaultProps = defaultProps;

export default compose(
  withRouter,
)(ManageCompanyPaymentInfo);
