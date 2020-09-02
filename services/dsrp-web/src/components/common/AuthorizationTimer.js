import React, { useState, useEffect } from "react";
import { Icon } from "antd";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { endUserTemporarySession } from "@/actionCreators/authorizationActionCreator";
import { getIsTimerVisible } from "@/reducers/authorizationReducer";

const propTypes = {
  issueDate: PropTypes.instanceOf(Date).isRequired,
  timeOut: PropTypes.number.isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  isTimerVisible: PropTypes.bool.isRequired,
};

const defaultProps = {};

const prettyTimer = (difference) => {
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  return hours + minutes + seconds > 0
    ? `Session expires in: ${hours}h ${minutes}m ${seconds}s `
    : "Session expired";
};

function AuthorizationTimer(props) {
  const endDate = new Date(new Date(props.issueDate.getTime() + props.timeOut * 1000));
  const [counter, setCounter] = useState(endDate.getTime() - new Date().getTime());

  useEffect(() => {
    const timer =
      counter > 0 && props.isTimerVisible && setInterval(() => setCounter(counter - 1000), 1000);
    if (counter <= 0) {
      props.endUserTemporarySession(props.history);
    }
    return () => clearInterval(timer);
  }, [counter]);

  return (
    <span
      title="You will be logged out after session times out"
      className="header-authorization-timer"
    >
      <Icon type="history" className="icon-lg" style={{ marginRight: "5px" }} />
      {prettyTimer(counter)}
    </span>
  );
}

AuthorizationTimer.propTypes = propTypes;
AuthorizationTimer.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  isTimerVisible: getIsTimerVisible(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      endUserTemporarySession,
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(AuthorizationTimer);
