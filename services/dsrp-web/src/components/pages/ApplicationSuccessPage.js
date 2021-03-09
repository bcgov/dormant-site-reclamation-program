import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { PageTracker } from "@/utils/trackers";

import { Row, Col, Typography, Icon, Result } from "antd";

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

const defaultProps = {};

const { Paragraph, Title, Text } = Typography;

export class ApplicationSuccessPage extends Component {
  render() {
    return (
      <Row type="flex" justify="center" align="top" className="landing-header">
        <PageTracker title="Application Success" />
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <Result
            icon={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />}
            title="Your application has been successfully submitted."
          />

          <Typography>
            <Title level={4}>Your reference number is: {this.props.match.params.id}</Title>

            <Paragraph>
              Please <Text strong>print this code</Text> for future reference and to check the
              status of your application.
            </Paragraph>
            <Title level={4}>What happens next</Title>
            <Paragraph>
              If any of the work applied for is approved, you will receive an agreement that you
              must sign and upload along with:
              <ul className="landing-list">
                <li>
                  A signed copy of the agreement you received from the Province of British Columbia
                </li>
                <li>
                  A copy of the contract between your company and the permit holder named in the
                  application
                </li>
                <li>A certificate of insurance</li>
                <li>
                  Evidence of Indigenous participation such as a letter, email or agreement that
                  confirms the Indigenous participation that is identified in the application
                </li>
              </ul>
              When the files have been uploaded, you may begin work and the initial payment will be
              processed and sent to you at the address provided.
            </Paragraph>
          </Typography>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

ApplicationSuccessPage.propTypes = propTypes;
ApplicationSuccessPage.defaultProps = defaultProps;

export default compose(connect(mapStateToProps, mapDispatchToProps))(ApplicationSuccessPage);
