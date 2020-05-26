/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated, userLoading } from "@/selectors/authenticationSelectors";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import { getUserInfoFromToken } from "@/actionCreators/authenticationActionCreator";
import Loading from "@/components/common/Loading";

/**
 * @constant authenticationGuard - a Higher Order Component Thats checks for user authorization and returns the App component if the user is Authenticated.
 */

const propTypes = {
  getUserInfoFromToken: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userLoading: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export const AuthenticationGuard = (isPublic) => (WrappedComponent) => {
  class authenticationGuard extends Component {
    componentDidMount() {
      this.authenticate();
    }

    async authenticate() {
      const token = localStorage.getItem("jwt");
      if (token && !this.props.isAuthenticated) {
        await this.props.getUserInfoFromToken(token);
      }
    }

    render() {
      if (this.props.isAuthenticated || isPublic) {
        return <WrappedComponent {...this.props} />;
      }
      if (!this.props.isAuthenticated && !this.props.userLoading) {
        return <UnauthenticatedNotice />;
      }
      return <Loading />;
    }
  }

  hoistNonReactStatics(authenticationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
    userLoading: userLoading(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        getUserInfoFromToken,
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(authenticationGuard);
};

AuthenticationGuard.propTypes = propTypes;

export default AuthenticationGuard;
