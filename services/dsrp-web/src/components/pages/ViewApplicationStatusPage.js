import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography, Button, Result, Icon } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import ViewApplicationStatusForm from "@/components/forms/ViewApplicationStatusForm";
import ApplicationStatusCard from "@/components/pages/ApplicationStatusCard";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import ContractedWorkPaymentView from "@/components/pages/ContractedWorkPaymentView";
import { fetchApplicationSummaryById } from "@/actionCreators/applicationActionCreator";
import { createOTL, endUserTemporarySession } from "@/actionCreators/authorizationActionCreator";
import { getApplication } from "@/reducers/applicationReducer";
import { HELP_EMAIL } from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import { PageTracker } from "@/utils/trackers";
import { isGuid } from "@/utils/helpers";
import * as router from "@/constants/routes";

const { Paragraph, Title } = Typography;

const propTypes = {
  fetchApplicationSummaryById: PropTypes.func.isRequired,
  createOTL: PropTypes.func.isRequired,
  loadedApplication: CustomPropTypes.applicationSummary,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
};

const defaultProps = {
  loadedApplication: { guid: "" },
};

export class ViewApplicationStatusPage extends Component {
  state = { guid: "", requestSent: false };

  componentDidMount = () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id &&
      isGuid(this.props.match.params.id)
    ) {
      this.props.fetchApplicationSummaryById(this.props.match.params.id).catch((error) => {
        if (error.response.status === 403) this.props.endUserTemporarySession(this.props.history);
      });
      this.setState({ guid: this.props.match.params.id });
    }
  };

  handleCheckAnotherApplication = () => {
    this.props.history.push(router.VIEW_APPLICATION_STATUS.route);
    this.setState({ guid: "" });
  };

  onFormSubmit = (values) => {
    // request OTL and redirect to request-access page
    return this.props
      .createOTL(values.guid)
      .then(() => {
        this.setState({ guid: values.guid, requestSent: true });
      })
      .catch(() => {
        this.props.endUserTemporarySession(this.props.history);
      });
  };

  render = () =>
    this.props.loadedApplication.guid !== this.state.guid ? (
      <>
        <PageTracker title="Application Status" />
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>View Application Status</Title>
            <Paragraph />
          </Col>
        </Row>
        {this.state.requestSent && (
          <Row type="flex" justify="center" align="top" className="landing-header">
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <Result
                icon={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />}
                title="One-Time Link has been sent to your email"
              />
            </Col>
          </Row>
        )}
        <Row type="flex" justify="center" align="top">
          <Col xl={24} xxl={20} sm={22}>
            <ViewApplicationStatusForm onSubmit={this.onFormSubmit} />
          </Col>
        </Row>
      </>
    ) : (
      <Row type="flex" justify="center" align="top" className="landing-header">
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <ApplicationStatusCard application={this.props.loadedApplication} />
          {this.props.loadedApplication.application_status_code === "WAIT_FOR_DOCS" && (
            <DocumentUploadForm applicationGuid={this.props.loadedApplication.guid} />
          )}
          {this.props.loadedApplication.application_status_code === "FIRST_PAY_APPROVED" && (
            <ContractedWorkPaymentView
              applicationGuid={this.props.loadedApplication.guid}
              applicationSummary={this.props.loadedApplication}
            />
          )}
          <br />
          <Paragraph>
            If you have any questions regarding your application,&nbsp;
            <a href={`mailto:${HELP_EMAIL}`}>contact us</a> and be sure to include your reference
            number.
          </Paragraph>
          <Button onClick={() => this.handleCheckAnotherApplication()}>
            Check another Application
          </Button>
        </Col>
      </Row>
    );
}

ViewApplicationStatusPage.propTypes = propTypes;
ViewApplicationStatusPage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  loadedApplication: getApplication(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationSummaryById,
      createOTL,
      endUserTemporarySession,
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ViewApplicationStatusPage);
