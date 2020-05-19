import React from "react";
import { Tooltip, Icon, Button } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  content: PropTypes.any.isRequired,
  iconPosition: PropTypes.oneOf(["left", "right"]),
};

const defaultProps = {
  iconPosition: "right",
};

export const ApplicationFormTooltip = (props) => {
  let iconStyle = { verticalAlign: "text-bottom", cursor: "help" };

  if (props.iconPosition === "left") {
    iconStyle = { ...iconStyle, marginRight: 8 };
  }

  if (props.iconPosition === "right") {
    iconStyle = { ...iconStyle, marginLeft: 8 };
  }

  return (
    <Tooltip title={<>{props.content}</>} {...props}>
      <Icon
        type="question-circle"
        theme="filled"
        className="icon-lg color-primary"
        style={iconStyle}
      />
    </Tooltip>
  );
};

ApplicationFormTooltip.propTypes = propTypes;
ApplicationFormTooltip.defaultProps = defaultProps;

export default ApplicationFormTooltip;
