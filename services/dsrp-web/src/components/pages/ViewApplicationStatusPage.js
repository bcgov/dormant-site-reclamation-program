import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography, Button } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import { isEmpty } from "lodash";

import ViewApplicationStatusForm from "@/components/forms/ViewApplicationStatusForm";
import ApplicationStatusCard from "@/components/pages/ApplicationStatusCard";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";

import { fetchApplicationSummaryById } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/reducers/applicationReducer";
import { PageTracker } from "@/utils/trackers";

import * as router from "@/constants/routes";

const { Paragraph, Title } = Typography;

const propTypes = {
  fetchApplicationSummaryById: PropTypes.func.isRequired,
  loadedApplication: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    json: PropTypes.any,
  }),
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  loadedApplication: { guid: "" },
};

const isGuid = (input) => {
  if (input[0] === "{") {
    input = input.substring(1, input.length - 1);
  }
  const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(input);
};

export class ViewApplicationStatusPage extends Component {
  state = { guid: "" };
  componentDidMount = () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id &&
      isGuid(this.props.match.params.id)
    ) {
      this.props.fetchApplicationSummaryById(this.props.match.params.id);
      this.setState({ guid: this.props.match.params.id });
    }
  };

  onFormSubmit = (values) => {
    this.props.fetchApplicationSummaryById(values.guid);
    this.setState({ guid: values.guid });
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
        <Row type="flex" justify="center" align="top">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ViewApplicationStatusForm onSubmit={this.onFormSubmit} />
          </Col>
        </Row>
      </>
    ) : (
      <Row type="flex" justify="center" align="top" className="landing-header">
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <ApplicationStatusCard application={this.props.loadedApplication} />
          {this.props.loadedApplication.application_status_code === "WAIT_FOR_DOCS" && (
            <>
              <DocumentUploadForm applicationGuid={this.props.loadedApplication.guid} />
            </>
          )}
          <br />
          <Button onClick={() => this.setState({ guid: "" })}>Check another Application</Button>
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
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ViewApplicationStatusPage);
