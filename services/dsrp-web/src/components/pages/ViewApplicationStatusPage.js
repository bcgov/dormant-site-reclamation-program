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
};

export class ViewApplicationStatusPage extends Component {
  onFormSubmit = (values) => {
    this.props.fetchApplicationById(values.guid);
  };

  render() {
    return (
      <>
        <Row
          type="flex"
          justify="center"
          align="top"
          className="landing-header"
          gutter={[{ sm: 0, xl: 64 }]}
        >
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>View Application Status</Title>
            <Paragraph>
              Morbi dignissim eget elit ac ornare. Aliquam rhoncus condimentum condimentum. Aenean
              sed diam non elit rutrum sollicitudin. Sed non leo odio.
            </Paragraph>
          </Col>
        </Row>
        <Row
          gutter={[{ sm: 0, xl: 64 }]}
          type="flex"
          justify="center"
          align="top"
          className="landing-section"
        >
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ViewApplicationStatusForm onSubmit={this.onFormSubmit} />
          </Col>
        </Row>
        {!isEmpty(this.props.loadedApplication) && (
          <Row
            gutter={[{ sm: 0, xl: 64 }]}
            type="flex"
            justify="center"
            align="top"
            className="landing-section"
          >
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <ApplicationStatusCard application={this.props.loadedApplication} />
            </Col>
          </Row>
        )}
      </>
    );
  }
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationStatusPage);
