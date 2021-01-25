import React from "react";
import PropTypes from "prop-types";
import { Form, Checkbox } from "antd";

/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool,
};

const defaultProps = {
  disabled: false,
};

const RenderCheckbox = (props) => (
  <Form.Item
    validateStatus={
      props.meta.touched || props.meta.submitFailed
        ? (props.meta.error && "error") || (props.meta.warning && "warning")
        : ""
    }
    help={
      (props.meta.touched || props.meta.submitFailed) &&
      ((props.meta.error && <span>{props.meta.error}</span>) ||
        (props.meta.warning && <span>{props.meta.warning}</span>))
    }
  >
    <Checkbox id={props.id} checked={props.input.value} {...props.input} disabled={props.disabled}>
      {props.label}
    </Checkbox>
  </Form.Item>
);

RenderCheckbox.propTypes = propTypes;
RenderCheckbox.defaultProps = defaultProps;

export default RenderCheckbox;
