import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";

import { isEmpty } from "lodash";

import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";

import ViewApplicationStatusForm from "@/components/forms/ViewApplicationStatusForm";
import ApplicationStatusCard from "@/components/pages/ApplicationStatusCard";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";

import { fetchApplicationById } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/reducers/applicationReducer";

import * as router from "@/constants/routes";

const { Paragraph, Title } = Typography;

const propTypes = {
  fetchApplicationById: PropTypes.func.isRequired,
  loadedApplication: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    json: PropTypes.any,
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const isGuid = (input) => {
  if (input[0] === "{") {
    input = input.substring(1, input.length - 1);
  }
  const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(input);
};

export class ViewApplicationStatusPage extends Component {
  componentDidMount = () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id &&
      isGuid(this.props.match.params.id)
    )
      this.props.fetchApplicationById(this.props.match.params.id);
  };

  onFormSubmit = (values) => {
    this.props.fetchApplicationById(values.guid);
  };

  onDocumentUpload = () => {
    // this.props.history.push(router.VIEW_APPLICATION_STATUS);
  };

  render = () =>
    isEmpty(this.props.loadedApplication) ? (
      <>
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>View Application Status</Title>
            <Paragraph />
          </Col>
        </Row>
        <Row type="flex" justify="center" align="top" className="landing-section">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ViewApplicationStatusForm onSubmit={this.onFormSubmit} />
          </Col>
        </Row>
      </>
    ) : (
      <Row type="flex" justify="center" align="top" className="landing-section">
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <ApplicationStatusCard application={this.props.loadedApplication} />
          {this.props.loadedApplication.application_status_code === "WAIT_FOR_DOCS" && (
            <>
              <Title level={3}>Upload Required Files</Title>
              <p>
                Use the document submission form below <strong>only</strong> if you have been
                requested to provide additional documentation related to your application.
              </p>
              <DocumentUploadForm
                onDocumentUpload={this.onDocumentUpload}
                application={this.props.loadedApplication.guid}
              />
            </>
          )}
        </Col>
      </Row>
    );
}

ViewApplicationStatusPage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  loadedApplication: getApplication(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationById,
    },
    dispatch
  );

// TODO: WHEN LAUNCH - REMOVE AuthorizationGuard()
export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationStatusPage);
