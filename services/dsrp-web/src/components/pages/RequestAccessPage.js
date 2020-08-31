import React, { Component } from "react";
import { connect } from "react-redux";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import { getApplication } from "@/reducers/applicationReducer";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import { exchangeOTLForOTP } from "@/actionCreators/authorizationActionCreator";
import * as router from "@/constants/routes";

const { Paragraph, Title } = Typography;

const propTypes = {
  fetchApplicationSummaryById: PropTypes.func.isRequired,
  loadedApplication: CustomPropTypes.applicationSummary,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  loadedApplication: { guid: "" },
};

const isGuid = (input) => {
  if (input[0] === "{") {
    input = input.substring(1, input.length - 1);
  }
  const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(input);
};

export class RequestAccessPage extends Component {
  state = { guid: "" };

  componentDidMount = () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id &&
      isGuid(this.props.match.params.id)
    ) {
      this.props.exchangeOTLForOTP(this.props.match.params.id).then((data) => {
        this.props.history.push(router.VIEW_APPLICATION.dynamicRoute(data.application_guid));
      });
    }
  };

  onFormSubmit = (values) => {
    this.props.exchangeOTLForOTP(values.guid);
    this.setState({ guid: values.guid });
  };

  render = () => (
    <>
      <Loading />;
    </>
  );
}

RequestAccessPage.propTypes = propTypes;
RequestAccessPage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  loadedApplication: getApplication(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      exchangeOTLForOTP,
    },
    dispatch
  );

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(RequestAccessPage);
