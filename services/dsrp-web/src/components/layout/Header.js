import React, { useEffect } from "react";
import { Layout, Row, Col, Tag } from "antd";
import { Link } from "react-router-dom";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";
import {
  getIsTimerVisible,
  getIssuedTimeUtc,
  getTimeOutSeconds,
} from "@/reducers/authorizationReducer";
import {
  initAuthorizationTimer,
  endUserTemporarySession,
} from "@/actionCreators/authorizationActionCreator";

import { ENVIRONMENT } from "@/constants/environment";
import AuthorizationTimer from "../common/AuthorizationTimer";

const propTypes = {
  xs: PropTypes.number.isRequired,
  lg: PropTypes.number.isRequired,
  xl: PropTypes.number.isRequired,
  xxl: PropTypes.number.isRequired,
  initAuthorizationTimer: PropTypes.func.isRequired,
  isTimerVisible: PropTypes.bool.isRequired,
  timeOutSeconds: PropTypes.number,
  issuedTimeUtc: PropTypes.instanceOf(Date),
  endUserTemporarySession: PropTypes.func.isRequired,
};

const defaultProps = {
  timeOutSeconds: null,
  issuedTimeUtc: null,
};

const smallestDesktopWidth = 1280;

const notProd = () => {
  if (ENVIRONMENT.environment.match(/^(development|test)$/)) return true;
  return false;
};

export const Header = (props) => {
  useEffect(() => {
    props.initAuthorizationTimer();
  }, [props.isTimerVisible]);
  return (
    <Layout.Header>
      <Row type="flex" justify="center" align="top">
        <Col xs={props.xs} lg={props.lg} xl={props.xl} xxl={props.xxl}>
          <div className="header-content">
            <span className="header-logo">
              <a href="https://gov.bc.ca/">
                <img id="bc-gov-header-img" alt="BC Government Logo" src={BC_GOV} />
              </a>
            </span>
            <span className="header-title">
              <Link to={routes.HOME.route}>
                <MediaQuery minWidth={smallestDesktopWidth}>
                  Dormant Sites Reclamation Program
                </MediaQuery>
                <MediaQuery maxWidth={smallestDesktopWidth - 1}>DSRP</MediaQuery>{" "}
                {notProd() && (
                  <Tag color="red" style={{ marginLeft: 5 }}>
                    Test Site
                  </Tag>
                )}
              </Link>
            </span>
            <span className="header-menu">
              {props.isTimerVisible && props.issuedTimeUtc && props.timeOutSeconds && (
                <AuthorizationTimer
                  issueDate={props.issuedTimeUtc}
                  timeOut={props.timeOutSeconds}
                />
              )}
              <HeaderDropdown endUserTemporarySession={() => props.endUserTemporarySession()} />
            </span>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  isTimerVisible: getIsTimerVisible(state),
  issuedTimeUtc: getIssuedTimeUtc(state),
  timeOutSeconds: getTimeOutSeconds(state),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      initAuthorizationTimer,
      endUserTemporarySession,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Header);
