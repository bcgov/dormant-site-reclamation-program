import React, { Component } from "react";
import { connect } from "react-redux";
import { Typography, Result, Icon, Row, Col } from "antd";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import { getApplication } from "@/reducers/applicationReducer";
import { getIsOTLExpired } from "@/reducers/authorizationReducer";
import Loading from "@/components/common/Loading";
import {
  exchangeOTLForOTP,
  endUserTemporarySession,
} from "@/actionCreators/authorizationActionCreator";
import * as router from "@/constants/routes";
import { isGuid } from "@/utils/helpers";
import LinkButton from "@/components/common/LinkButton";

const { Text } = Typography;

const propTypes = {
  exchangeOTLForOTP: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
  isOTLExpired: PropTypes.bool.isRequired,
};

const defaultProps = {};

export class RequestAccessPage extends Component {
  componentDidMount = () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id &&
      isGuid(this.props.match.params.id)
    ) {
      this.props
        .exchangeOTLForOTP(this.props.match.params.id)
        .then((data) => {
          this.props.history.push(
            router.VIEW_APPLICATION_STATUS_LINK.dynamicRoute(data.application_guid)
          );
        })
        .catch(() => {
          this.props.endUserTemporarySession(this.props.history);
        });
    } else {
      this.props.endUserTemporarySession(this.props.history);
    }
  };

  render = () => {
    return this.props.isOTLExpired ? (
      <>
        <Row type="flex" justify="center" align="top" className="landing-header">
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Result
              icon={<Icon type="exclamation-circle" />}
              title="The one-time use link has expired"
              subTitle={
                <Text>
                  Please return to the previous page and request a new Link
                  <br />
                  <LinkButton
                    onClick={() => this.props.history.push(router.VIEW_APPLICATION_STATUS.route)}
                  >
                    Return
                  </LinkButton>
                </Text>
              }
            />
          </Col>
        </Row>
      </>
    ) : (
      <Loading />
    );
  };
}

RequestAccessPage.propTypes = propTypes;
RequestAccessPage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  loadedApplication: getApplication(state),
  isOTLExpired: getIsOTLExpired(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      exchangeOTLForOTP,
      endUserTemporarySession,
    },
    dispatch
  );

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(RequestAccessPage);
