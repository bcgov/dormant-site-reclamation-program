import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Typography, Switch, Icon, Card, Popconfirm, Drawer, Button } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import ReviewApplicationInfo from "@/components/admin/ReviewApplicationInfo";
import { updateAppSetting, fetchAppSettings } from "@/actionCreators/appSettingsActionCreator";
import { getAppSettings } from "@/selectors/appSettingsSelectors";
import * as Strings from "@/constants/strings";
import Loading from "@/components/common/Loading";
import WarningBanner from "@/components/common/WarningBanner";
import { PageTracker } from "@/utils/trackers";

const { Paragraph, Title } = Typography;

const propTypes = {
  updateAppSetting: PropTypes.func.isRequired,
  fetchAppSettings: PropTypes.func.isRequired,
  appSettings: PropTypes.any,
};

export class ReviewApplicationsPage extends Component {
  state = { isLoaded: false, adminDrawerVisible: false };

  componentDidMount() {
    this.props.fetchAppSettings().then(() => {
      this.setState({ isLoaded: true });
    });
  }

  changeDisableApplications = (disableApplications) => {
    this.props
      .updateAppSetting({
        setting: Strings.DISABLE_APPLICATIONS,
        setting_value: !disableApplications,
      })
      .then(() => {
        this.props.fetchAppSettings();
      });
  };

  showDrawer = () => {
    this.setState({ adminDrawerVisible: true });
  };

  onDrawerClose = () => {
    this.setState({ adminDrawerVisible: false });
  };

  render() {
    if (this.state.isLoaded) {
      const appsDisabled = this.props.appSettings.filter(
        (setting) => setting.setting === Strings.DISABLE_APPLICATIONS
      )[0].setting_value;
      return (
        <>
          <PageTracker title="Application List" />
          {appsDisabled && <WarningBanner type="disabled" />}
          <Drawer
            title="Admin Options"
            placement="right"
            closable={false}
            onClose={this.onDrawerClose}
            visible={this.state.adminDrawerVisible}
          >
            <Row type="flex" justify="center" align="top">
              <Col>
                <Title level={4}>Enable/Disable Applications</Title>
                <Paragraph>
                  If this toggle is disabled, applications will not be accepted through the online
                  portal.
                </Paragraph>
                <Popconfirm
                  title={`Are you sure you want to ${
                    appsDisabled ? "enable" : "disable"
                  } application submission?`}
                  onConfirm={() => {
                    this.changeDisableApplications(appsDisabled);
                  }}
                  okText="Yes"
                  cancelText="No"
                  placement="topRight"
                  arrowPointAtCenter
                >
                  <Switch
                    checkedChildren="Applications Enabled"
                    unCheckedChildren="Applications Disabled"
                    checked={!appsDisabled}
                  />
                </Popconfirm>
              </Col>
            </Row>
          </Drawer>

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
              <Button
                type="link"
                onClick={this.showDrawer}
                style={{ float: "right", marginTop: 70, zIndex: 1000 }}
              >
                <Icon type="setting" className="icon-lg" />
                Admin Options
              </Button>
              <ReviewApplicationInfo />
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
      updateAppSetting,
    },
    dispatch
  );

ReviewApplicationsPage.propTypes = propTypes;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ReviewApplicationsPage);
