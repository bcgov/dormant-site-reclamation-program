import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Col } from "antd";
import * as ENV from "@/constants/environment";
import { getIsAdmim } from "@/selectors/authenticationSelectors";

const propTypes = {
  isAdmin: PropTypes.func.isRequired,
};

export const AdminLogin = (props) => (
  <>
    {!props.isAdmin && (
      <Col xs={24} lg={3}>
        <a
          href={`${ENV.KEYCLOAK.loginURL}${ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${ENV.KEYCLOAK.idpHint}`}
        >
          Admin
        </a>
      </Col>
    )}
  </>
);

const mapStateToProps = (state) => ({
  isAdmin: getIsAdmim(state),
});

AdminLogin.propTypes = propTypes;

export default connect(mapStateToProps)(AdminLogin);
