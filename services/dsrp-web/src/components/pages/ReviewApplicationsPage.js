import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Typography, Switch, Icon, Card, Popconfirm } from "antd";

import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import ReviewApplicationInfo from "@/components/admin/ReviewApplicationInfo";
import { updateAppSetting, fetchAppSettings } from "@/actionCreators/appSettingsActionCreator";
import { getAppSettings } from "@/selectors/appSettingsSelectors";
import * as Strings from "@/constants/strings";
import Loading from "@/components/common/Loading";

const { Paragraph, Title } = Typography;

const propTypes = {
  updateAppSetting: PropTypes.func.isRequired,
  fetchAppSettings: PropTypes.func.isRequired,
  appSettings: PropTypes.any,
};

export class ReviewApplicationsPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchAppSettings().then(() => {
      this.setState({ isLoaded: true });
    });
  }

  disableSubmissions = (currentSettingValue) => {
    this.props
      .updateAppSetting({
        setting: Strings.DISABLE_APPLICATIONS,
        setting_value: !currentSettingValue,
      })
      .then(() => {
        this.props.fetchAppSettings();
      });
  };

  render() {
    if (this.state.isLoaded) {
      const appsDisabled = this.props.appSettings.filter(
        (setting) => setting.setting === Strings.DISABLE_APPLICATIONS
      )[0].setting_value;
      return (
        <>
          <Row gutter={16} type="flex" justify="end" align="top">
            <Col style={{ padding: 20 }}>
              <Card size="small" title="Disable/Enable Applications" style={{ width: 300 }}>
                <p>
                  If this toggle is activated, applications will not be accepted through the online
                  portal
                </p>
                <div className="center">
                  <Popconfirm
                    title="Are you sure you want to disable application submission?"
                    onConfirm={() => {
                      this.disableSubmissions(appsDisabled);
                    }}
                    okText="Yes"
                    cancelText="No"
                    placement="topRight"
                    arrowPointAtCenter
                  >
                    <Switch
                      unCheckedChildren="Disabled"
                      checkedChildren="Enabled"
                      checked={!appsDisabled}
                    />
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center" align="top" className="landing-header">
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <Title>Review Applications</Title>
              <Paragraph>
                This table shows all of the applications received for the program. To review the
                individual work components, click <Icon type="plus-square" /> next to the Well
                Authorization Number. Click <Icon type="eye" /> to open the original application or
                view the documents related to the application.
              </Paragraph>
            </Col>
          </Row>
          <Row type="flex" justify="center" align="top" className="landing-section">
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <ReviewApplicationInfo />
            </Col>
          </Row>
        </>
      );
    } else {
      return (
        <>
          <Loading />
        </>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  appSettings: getAppSettings(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchAppSettings,
      updateAppSetting,
    },
    dispatch
  );

ReviewApplicationsPage.propTypes = propTypes;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ReviewApplicationsPage);
