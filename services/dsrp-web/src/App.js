import React, { Component } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import { Layout, BackTop, Row, Col, Spin, Icon } from "antd";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import Routes from "./routes/Routes";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ModalWrapper from "@/components/common/wrappers/ModalWrapper";
import AuthenticationGuard from "@/hoc/AuthenticationGuard";
import WarningBanner from "@/components/common/WarningBanner";
import { detectIE } from "@/utils/environmentUtils";
import configureStore from "./store/configureStore";
import ScrollToTopWrapper from "@/components/common/wrappers/ScrollToTopWrapper";
import { loadBulkStaticContent } from "@/actionCreators/staticContentActionCreator";
import { MatomoLinkTracing } from "@/utils/trackers";

export const store = configureStore();

Spin.setDefaultIndicator(<Icon type="loading" style={{ fontSize: 40 }} />);

const propTypes = {
  loadBulkStaticContent: PropTypes.func.isRequired,
};

class App extends Component {
  state = { isIE: true, isMobile: true };

  componentDidMount() {
    this.setState({ isIE: detectIE() });
    this.props.loadBulkStaticContent();
  }

  handleMobileWarningClose = () => {
    this.setState({ isMobile: false });
  };

  handleBannerClose = () => {
    this.setState({ isIE: false });
  };

  render() {
    const { Content } = Layout;
    const xs = 24;
    const lg = 22;
    const xl = 20;
    const xxl = 22;
    const contentFull = 24;
    return (
      <BrowserRouter basename={process.env.BASE_PATH}>
        <ScrollToTopWrapper>
          <MatomoLinkTracing />
          <Layout>
            <Header xs={xs} lg={lg} xl={xl} xxl={xxl} />
            <Layout>
              <Content>
                {this.state.isIE && <WarningBanner type="IE" onClose={this.handleBannerClose} />}
                <MediaQuery maxWidth={500}>
                  {this.state.isMobile && (
                    <WarningBanner type="mobile" onClose={this.handleMobileWarningClose} />
                  )}
                </MediaQuery>
                <Row type="flex" justify="center" align="top">
                  <Col xs={xs} lg={lg} xl={xl} xxl={contentFull}>
                    <Routes />
                  </Col>
                </Row>
                <ModalWrapper />
                <BackTop />
              </Content>
            </Layout>
            <Footer xs={xs} lg={lg} xl={xl} xxl={xxl} />
          </Layout>
        </ScrollToTopWrapper>
      </BrowserRouter>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadBulkStaticContent,
    },
    dispatch
  );

App.propTypes = propTypes;

export default compose(
  connect(null, mapDispatchToProps),
  hot(module),
  AuthenticationGuard(true)
)(App);
