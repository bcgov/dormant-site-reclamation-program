import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ReviewApprovedContractedWorkInfo from "@/components/admin/ReviewApprovedContractedWorkInfo";
import { Row, Col, Typography, Icon, Card, Popconfirm, Drawer, Button } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import * as Strings from "@/constants/strings";
import { PageTracker } from "@/utils/trackers";

const { Paragraph, Title } = Typography;

const propTypes = {};

export class ReviewApprovedContractedWorkPage extends Component {
  state = {};

  componentDidMount() {}

  render() {
    return (
      <>
        <PageTracker title="Review Approved Contracted Work" />
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>Review Approved Contracted Work</Title>
            <Paragraph>
              This table shows all of the approved contracted work items for each approved
              application in the program.
            </Paragraph>
          </Col>
        </Row>
        <Row type="flex" justify="center" align="top" className="landing-section">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ReviewApprovedContractedWorkInfo />
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

ReviewApprovedContractedWorkPage.propTypes = propTypes;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ReviewApprovedContractedWorkPage);
