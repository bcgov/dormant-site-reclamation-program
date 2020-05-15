import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import hoistNonReactStatics from "hoist-non-react-statics";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";
import * as Permission from "@/constants/permissions";
import { getIsAdmin, isAuthenticated } from "@/selectors/authenticationSelectors";
import { detectDevelopmentEnvironment, detectProdEnvironment } from "@/utils/environmentUtils";

/**
 * @constant AuthorizationGuard - Higher Order Component that provides "feature flagging", in order to hide routes that
 * are not ready to be in PROD, pass in `inDevelopment` or 'inTesting` param to keep the content environment specific.
 */
const propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export const AuthorizationGuard = (permission) => (WrappedComponent) => {
  const authorizationGuard = (props) => {
    if (
      props.isAuthenticated ||
      (permission === Permission.IN_DEVELOPMENT && detectDevelopmentEnvironment()) ||
      (permission === Permission.IN_TESTING && !detectProdEnvironment())
    ) {
      return <WrappedComponent {...props} />;
    }
    return <UnauthenticatedNotice />;
  };

  hoistNonReactStatics(authorizationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAdmin: getIsAdmin(state),
    isAuthenticated: isAuthenticated(state),
  });

  authorizationGuard.propTypes = propTypes;
  return connect(mapStateToProps)(authorizationGuard);
};

export default AuthorizationGuard;
