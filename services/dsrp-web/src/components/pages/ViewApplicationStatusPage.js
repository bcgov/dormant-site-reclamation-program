import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { isEmpty } from "lodash";

import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";

import ViewApplicationStatusForm from "@/components/forms/ViewApplicationStatusForm";
import ApplicationStatusCard from "@/components/pages/ApplicationStatusCard";

import { fetchApplicationById } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/reducers/applicationReducer";

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
};

const isGuid = (input) => {
  if (input[0] === "{") {
    input = input.substring(1, input.length - 1);
  }
  var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(input);
};

export class ViewApplicationStatusPage extends Component {
  componentDidMount = () => {
    console.log(JSON.stringify(this.props));
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

  render = () =>
    isEmpty(this.props.loadedApplication) ? (
      <>
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>View Application Status</Title>
            <Paragraph></Paragraph>
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
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationStatusPage);
