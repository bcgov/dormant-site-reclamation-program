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

const propTypes = {};

export class ReviewCompanyPaymentInfoPage extends Component {
  state = {};

  componentDidMount() {}

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
            <Button
              type="link"
              onClick={console.log("add")}
              style={{ float: "right", marginTop: 40 }}
            >
              Add New
              <Icon type="plus-square" className="icon-lg" />
            </Button>
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

ReviewCompanyPaymentInfoPage.propTypes = propTypes;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ReviewCompanyPaymentInfoPage);
