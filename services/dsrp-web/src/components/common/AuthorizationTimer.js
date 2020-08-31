import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const propTypes = {
  issueDate: PropTypes.instanceOf(Date).isRequired,
  timeOut: PropTypes.number.isRequired,
};

const prettyTimer = (difference) => {
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s `;
};

function AuthorizationTimer(props) {
  const endDate = new Date(new Date(props.issueDate.getTime() + props.timeOut * 1000));
  const [counter, setCounter] = useState(endDate.getTime() - new Date().getTime());

  useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1000), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  return <span className="header-authorization-timer">{prettyTimer(counter)}</span>;
}

AuthorizationTimer.propTypes = propTypes;

export default AuthorizationTimer;
