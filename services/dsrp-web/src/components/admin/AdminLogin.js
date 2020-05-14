import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as ENV from "@/constants/environment";
import { getIsAdmim } from "@/selectors/authenticationSelectors";

const propTypes = {
  isAdmin: PropTypes.func.isRequired,
};

export const AdminLogin = (props) => (
  <>
    {!props.isAdmin && (
      <a
        className="footer-link"
        href={`${ENV.KEYCLOAK.loginURL}${ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${ENV.KEYCLOAK.idpHint}`}
      >
        Admin
      </a>
    )}
  </>
);

const mapStateToProps = (state) => ({
  isAdmin: getIsAdmim(state),
});

AdminLogin.propTypes = propTypes;

export default connect(mapStateToProps)(AdminLogin);
