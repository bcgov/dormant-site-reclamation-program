import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ManageCompanyPaymentInfo from "@/components/admin/ManageCompanyPaymentInfo";
import { Row, Col, Typography, Icon, Card, Popconfirm, Drawer, Button } from "antd";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import * as Strings from "@/constants/strings";
import { PageTracker } from "@/utils/trackers";

const { Paragraph, Title } = Typography;

export class ReviewCompanyPaymentInfoPage extends Component {

  render() {
    return (
      <>
        <PageTracker title="Manage Company Payment Info" />
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>Company Payment Info</Title>
            <Paragraph>
              This table shows all of the company payment info records and allows you to update them.
            </Paragraph>
          </Col>
        </Row>
        <Row type="flex" justify="center" align="top" className="landing-section">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <ManageCompanyPaymentInfo />
          </Col>
        </Row>
      </>
    );
  }
}

export default compose(
  AuthorizationGuard()
)(ReviewCompanyPaymentInfoPage);
