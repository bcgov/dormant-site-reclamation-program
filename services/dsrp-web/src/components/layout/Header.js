import React from "react";
import { Layout, Row, Col } from "antd";
import { Link } from "react-router-dom";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import HeaderDropdown from "@/components/layout/HeaderDropdown";
import * as routes from "@/constants/routes";
import { BC_GOV } from "@/constants/assets";

const propTypes = {
  xs: PropTypes.number.isRequired,
  lg: PropTypes.number.isRequired,
  xl: PropTypes.number.isRequired,
  xxl: PropTypes.number.isRequired,
};

const smallestDesktopWidth = 640;

export const Header = (props) => (
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
              <MediaQuery maxWidth={smallestDesktopWidth - 1}>DSRP</MediaQuery>
            </Link>
          </span>
          <span className="header-menu">
            <HeaderDropdown />
          </span>
        </div>
      </Col>
    </Row>
  </Layout.Header>
);

Header.propTypes = propTypes;

export default Header;
