import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Row, Col, Typography, Icon, Tabs } from "antd";
import { reset } from "redux-form";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import { fetchApplicationById } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import ViewApplicationDocuments from "@/components/pages/ViewApplicationDocuments";
import LinkButton from "@/components/common/LinkButton";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import Loading from "@/components/common/Loading";

const { TabPane } = Tabs;
const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchApplicationById: PropTypes.func.isRequired,
  application: PropTypes.any,
};

const defaultProps = {
  application: {},
};

const { Title } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchApplicationById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <>
        {(this.state.isLoaded && (
          <>
            <Row type="flex" justify="center" align="top" className="landing-header">
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <LinkButton onClick={this.goBack}>
                  <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                  Return to Review Applications
                </LinkButton>
              </Col>
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Title>Application Reference Number: {this.props.application.guid}</Title>
              </Col>
            </Row>
            <Row type="flex" justify="center" align="top" className="landing-header">
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Tabs type="card">
                  <TabPane tab="Application" key="1" style={{ padding: "20px" }}>
                    <ViewOnlyApplicationForm
                      isViewingSubmission
                      initialValues={this.props.application.json}
                    />
                  </TabPane>
                  <TabPane tab="Documents" key="2" style={{ padding: "20px" }}>
                    <ViewApplicationDocuments
                      application_guid={this.props.application.guid}
                      documents={this.props.application.documents}
                    />
                    <DocumentUploadForm applicationGuid={this.props.application.guid} />
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </>
        )) || <Loading />}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  application: getApplication(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationById,
      reset,
    },
    dispatch
  );

ViewApplicationPage.propTypes = propTypes;
ViewApplicationPage.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationPage);
