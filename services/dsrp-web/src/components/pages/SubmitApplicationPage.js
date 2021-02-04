import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { fetchAppSettings } from "@/actionCreators/appSettingsActionCreator";
import { getAppSettings } from "@/selectors/appSettingsSelectors";
import * as Strings from "@/constants/strings";
import Loading from "@/components/common/Loading";
import { PageTracker } from "@/utils/trackers";
import { endUserTemporarySession } from "@/actionCreators/authorizationActionCreator";

const { Title, Paragraph } = Typography;

const propTypes = {
  appSettings: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchAppSettings: PropTypes.func.isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
};

export class SubmitApplicationPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.endUserTemporarySession();
    this.props.fetchAppSettings().then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    if (this.state.isLoaded) {
      const apps_disabled = this.props.appSettings.filter(
        (setting) => setting.setting === Strings.DISABLE_APPLICATIONS
      )[0].setting_value;
      return apps_disabled ? (
        <>
          <PageTracker title="Submit Application" />
          <Row
            type="flex"
            justify="center"
            align="top"
            className="landing-header"
            gutter={[{ sm: 0, xl: 64 }]}
          >
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <Title>Submit Application</Title>
              <Paragraph>
                At this time we are not accepting applications. Please contact us at{" "}
                <a href={`mailto: ${Strings.HELP_EMAIL}`}>{Strings.HELP_EMAIL}</a>
              </Paragraph>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row type="flex" justify="center" align="top" className="landing-header">
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <Title>Submit Application</Title>
              <Paragraph>
                You must submit a separate application for each contract you have with an eligible
                contract holder. Any work in an application that is not in the contract, cannot
                qualify for the program.
              </Paragraph>
              <Paragraph>
                Applications will be accepted for work on dormant oil or natural gas sites that have
                been nominated under the Site Nomination process.
              </Paragraph>
            </Col>
          </Row>
          <Row type="flex" justify="center" align="top" className="landing-section">
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <ApplicationForm />
            </Col>
          </Row>
        </>
      );
    }
    return (
      <>
        <Loading />
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

SubmitApplicationPage.propTypes = propTypes;

export default compose(connect(mapStateToProps, mapDispatchToProps))(SubmitApplicationPage);
