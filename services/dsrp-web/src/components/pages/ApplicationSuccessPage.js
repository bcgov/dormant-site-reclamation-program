import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";

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
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <Result
            icon={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />}
            title="Your application has been successfully submitted."
          />

          <Typography>
            <Title level={4}>Your reference code is: {this.props.match.params.id}</Title>

            <Paragraph>
              Please <Text strong>print this code</Text> for future reference and to check the
              status of your application.
            </Paragraph>
            <Title level={4}>What happens next</Title>
            <Paragraph>
              If your application is approved, you will need to submit the following:
              <ul>
                <li>Contract with Permit Holder</li>
                <li>Criminal Records Check</li>
                <li>Certificate of Insurance</li>
              </ul>
              You will also be sent Shared Cost Arrangement (Schedule A) to sign and return before
              first payment can be processed.
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
