import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Row, Col, Button, Typography } from "antd";
import * as routes from "@/constants/routes";
import { fetchAppSettings } from "@/actionCreators/appSettingsActionCreator";
import { getAppSettings } from "@/selectors/appSettingsSelectors";
import * as Strings from "@/constants/strings";
import { PageTracker } from "@/utils/trackers";
import { endUserTemporarySession } from "@/actionCreators/authorizationActionCreator";

const { Paragraph, Title } = Typography;

const propTypes = {
  appSettings: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchAppSettings: PropTypes.func.isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
};

export class LandingPage extends Component {
  state = { appsDisabled: true };

  componentDidMount = () => {
    this.props.fetchAppSettings();
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.appSettings !== this.props.appSettings) {
      const appsDisabled = nextProps.appSettings.filter(
        (setting) => setting.setting === Strings.DISABLE_APPLICATIONS
      )[0].setting_value;
      this.setState({ appsDisabled });
    }
  };

  render() {
    return (
      <>
        <PageTracker title="Landing Page" />
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title level={1}>Dormant Sites Reclamation Program</Title>
            <Paragraph>
              The Dormant Sites Reclamation Program (Program) will access $100 million of federal
              funding provided to the Province of British Columbia to clean up dormant oil and gas
              wells. The funding was established as part of the federal government’s COVID-19
              Economic Response Plan.
            </Paragraph>
            <Paragraph>
              The Program will offer opportunities for oil and natural gas service sector
              contractors in British Columbia to apply for a financial contribution to undertake and
              complete work on dormant site reclamation.
            </Paragraph>
            <Paragraph>
              The Program will also provide Indigenous peoples, landowners and local communities in
              British Columbia the opportunity to nominate dormant sites for reclamation.
            </Paragraph>

            <Title level={4}>Funding Increment 2 - $50,000,000 Financial Contribution</Title>
            <Paragraph>
              Applications will be accepted from British Columbia contractors for work on dormant
              oil or natural gas sites that have been nominated under the{" "}
              <a
                href="https://www2.gov.bc.ca/gov/content/industry/natural-gas-oil/responsible-oil-gas-development/dormant-sites-reclamation-program/site-nomination"
                target="_blank"
              >
                Site Nomination
              </a>{" "}
              process.
            </Paragraph>
            <Paragraph>
              <strong>Note:</strong> All Permit Holders that had sites nominated in this process
              have been notified.
            </Paragraph>

            <Title level={4}>Before you apply:</Title>
            <Paragraph>
              <ul className="landing-list">
                <li>
                  Read the <strong>full details</strong> of the program by{" "}
                  <a
                    href="https://www2.gov.bc.ca/gov/content/industry/natural-gas-oil/responsible-oil-gas-development/dormant-sites-reclamation-program"
                    target="_blank"
                  >
                    clicking here
                  </a>
                  .
                </li>
              </ul>
            </Paragraph>

            <Title level={4}>What you need to apply:</Title>
            <Paragraph>
              <ul className="landing-list">
                <li>Company details</li>
                <li>Company contact information</li>
              </ul>
            </Paragraph>

            <Title level={4}> For each site, contractors must provide:</Title>
            <Paragraph>
              <ul className="landing-list">
                <li>Permit holder name</li>
                <li>Well authorization number</li>
                <li>Job steps</li>
                <li>Estimated cost of every work component</li>
                <li>Subcontractor details, where applicable</li>
              </ul>
            </Paragraph>
            <br />
            <br />
            {this.state.appsDisabled && (
              <Paragraph strong>
                Increment 1 of the Program has closed to applications July 28, 2020.
              </Paragraph>
            )}
            <Row type="flex" justify="center">
              <Col>
                {!this.state.appsDisabled && (
                  <Link to={routes.SUBMIT_APPLICATION.route} style={{ textDecoration: "none" }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => this.props.endUserTemporarySession()}
                    >
                      Apply Now
                    </Button>
                  </Link>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  appSettings: getAppSettings(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchAppSettings,
      endUserTemporarySession,
    },
    dispatch
  );

LandingPage.propTypes = propTypes;

export default compose(connect(mapStateToProps, mapDispatchToProps))(LandingPage);
