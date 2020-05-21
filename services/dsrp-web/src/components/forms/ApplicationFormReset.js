import React from "react";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

export const ApplicationFormReset = (props) => (
  <Popconfirm
    title="Are you sure you want to clear all of the contents of this application form?"
    onConfirm={() => props.onConfirm()}
    okText="Yes"
    cancelText="No"
    placement="topRight"
    arrowPointAtCenter
  >
    <Button htmlType="reset" style={{ float: "right", marginLeft: 8 }}>
      Clear Form
    </Button>
  </Popconfirm>
);

ApplicationFormReset.propTypes = propTypes;

export default ApplicationFormReset;
