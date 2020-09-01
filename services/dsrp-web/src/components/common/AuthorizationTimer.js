import React, { useState, useEffect } from "react";
import { Icon } from "antd";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import * as router from "@/constants/routes";
import { cleanUserOneTimeAuthorizationInfo } from "@/utils/helpers";

const propTypes = {
  issueDate: PropTypes.instanceOf(Date).isRequired,
  timeOut: PropTypes.number.isRequired,
};

const prettyTimer = (difference) => {
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  return hours + minutes + seconds > 0
    ? `session expires in: ${hours}h ${minutes}m ${seconds}s `
    : "session expired";
};

function AuthorizationTimer(props) {
  const endDate = new Date(new Date(props.issueDate.getTime() + props.timeOut * 1000));
  const [counter, setCounter] = useState(endDate.getTime() - new Date().getTime());

  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1000), 1000);
    // TODO dispatch redirect to access-request page with state false ?
    if (counter <= 0) {
      cleanUserOneTimeAuthorizationInfo();
    }
    return () => clearInterval(timer);
  }, [counter]);

  return counter < 0 ? (
    <Redirect to={router.REQUEST_ACCESS.dynamicRoute()} />
  ) : (
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

export default AuthorizationTimer;
