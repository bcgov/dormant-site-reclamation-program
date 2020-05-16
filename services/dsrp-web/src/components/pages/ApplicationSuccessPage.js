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
      <Row
        type="flex"
        justify="center"
        align="top"
        className="landing-header"
        gutter={[{ sm: 0, xl: 64 }]}
      >
        <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
          <div>
            <Result
              icon={<Icon type="like" />}
              title="Your application has been successfully submitted."
              subTitle="You will recieve a confirmation email shorty."
            />
            <Title>{this.props.match.params.id}</Title>
          </div>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

ApplicationSuccessPage.propTypes = propTypes;
ApplicationSuccessPage.defaultProps = defaultProps;

// TO:DO WHEN LAUNCH - REMOVE AuthorizationGuard()
export default compose(connect(mapStateToProps, mapDispatchToProps))(ApplicationSuccessPage);
