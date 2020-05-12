import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Menu, Dropdown, Button, Icon, Divider } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import * as ENV from "@/constants/environment";
import * as routes from "@/constants/routes";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { isAuthenticated, getUserInfo } from "@/selectors/authenticationSelectors";
import { MENU } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  userInfo: {},
};

export class HeaderDropdown extends Component {
  handleLogout = () => {
    signOutFromSiteMinder();
  };

  setActiveLink = (pathname) => {
    return this.props.location.pathname === pathname ? "header-link active" : "header-link";
  };

  render() {
    const menuItemLogout = (
      <Menu.Item key="logout">
        <Button className="header-dropdown-item-button" onClick={this.handleLogout}>
          Log out
        </Button>
      </Menu.Item>
    );

    const anchorTagLogin = (
      <a
        href={`${ENV.KEYCLOAK.loginURL}${ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${ENV.KEYCLOAK.idpHint}`}
      >
        Log in
      </a>
    );

    const dropdownMenuMobile = (
      <Menu className="header-dropdown-menu">
        {!this.props.isAuthenticated && (
          <Menu.Item key="login">
            <Button className="header-dropdown-item-button">{anchorTagLogin}</Button>
          </Menu.Item>
        )}
        <Menu.Item key="submit-application">
          <Button className="header-dropdown-item-button">
            <Link to={routes.SUBMIT_APPLICATION.route}>Apply</Link>
          </Button>
        </Menu.Item>
        <Menu.Item key="view-application-status">
          <Button className="header-dropdown-item-button">
            <Link to={routes.VIEW_APPLICATION_STATUS.route}>Status</Link>
          </Button>
        </Menu.Item>
        <AuthorizationWrapper>
          <Divider className="bg-color-table-seperator" style={{ margin: 0 }} />
          <Menu.Item key="review-applications">
            <Button className="header-dropdown-item-button">
              <Link to={routes.REVIEW_APPLICATIONS.route}>Applications</Link>
            </Button>
          </Menu.Item>
        </AuthorizationWrapper>
        <Divider className="bg-color-table-seperator" style={{ margin: 0 }} />
        {this.props.isAuthenticated && menuItemLogout}
      </Menu>
    );

    const dropdownMenuDesktop = (
      <Menu className="header-dropdown-menu">
        <AuthorizationWrapper>
          <Menu.Item key="review-applications">
            <Button className="header-dropdown-item-button">
              <Link to={routes.REVIEW_APPLICATIONS.route}>Applications</Link>
            </Button>
          </Menu.Item>
        </AuthorizationWrapper>
        {this.props.isAuthenticated && menuItemLogout}
      </Menu>
    );

    const smallestDesktopWidth = 1280;
    return (
      <>
        <MediaQuery minWidth={smallestDesktopWidth}>
          <span>
            <Link
              to={routes.SUBMIT_APPLICATION.route}
              className={this.setActiveLink(routes.SUBMIT_APPLICATION.route)}
            >
              Apply
            </Link>
            <Link
              to={routes.VIEW_APPLICATION_STATUS.route}
              className={this.setActiveLink(routes.VIEW_APPLICATION_STATUS.route)}
            >
              Status
            </Link>
            {(this.props.isAuthenticated && (
              <Dropdown overlay={dropdownMenuDesktop}>
                <Button className="header-dropdown-button">
                  {this.props.userInfo.email}
                  <Icon type="caret-down" />
                </Button>
              </Dropdown>
            )) || (
              <Button className="login-btn" style={{ marginLeft: 32 }}>
                {anchorTagLogin}
              </Button>
            )}
          </span>
        </MediaQuery>
        <MediaQuery maxWidth={smallestDesktopWidth - 1}>
          <Dropdown overlay={dropdownMenuMobile} placement="bottomRight">
            <Button id="dropdown-menu-mobile-trigger" className="header-dropdown-button">
              <img src={MENU} alt="Menu" />
            </Button>
          </Dropdown>
        </MediaQuery>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isAuthenticated: isAuthenticated(state),
});

HeaderDropdown.propTypes = propTypes;
HeaderDropdown.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps)(HeaderDropdown));
