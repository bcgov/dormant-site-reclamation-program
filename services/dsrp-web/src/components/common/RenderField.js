import React from "react";
import PropTypes from "prop-types";
import { Form, Input, Icon } from "antd";

/**
 * @constant RenderField - Ant Design `Input` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  disabled: PropTypes.bool,
  defaultValue: PropTypes.string,
  allowClear: PropTypes.bool,
  labelCol: PropTypes.object,
  wrapperCol: PropTypes.object,
};

const defaultProps = {
  label: "",
  placeholder: "",
  disabled: false,
  defaultValue: "",
  allowClear: false,
  labelCol: {},
  wrapperCol: {},
};

const RenderField = (props) => {
  return (
    <Form.Item
      label={props.label}
      validateStatus={
        props.meta.touched ? (props.meta.error && "error") || (props.meta.warning && "warning") : ""
      }
      help={
        props.meta.touched &&
        ((props.meta.error && <span>{props.meta.error}</span>) ||
          (props.meta.warning && <span>{props.meta.warning}</span>))
      }
      labelCol={props.labelCol}
      wrapperCol={props.wrapperCol}
      labelAlign={props.labelAlign}
      style={props.style}
    >
      <Input
        id={props.id}
        disabled={props.disabled}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        allowClear={props.allowClear}
        suffix={
          <div className={props.meta.asyncValidating ? "" : "hidden"}>
            <Icon type="sync" spin />
          </div>
        }
        style={props.inputStyle}
        {...props.input}
      />
    </Form.Item>
  );
};
RenderField.propTypes = propTypes;
RenderField.defaultProps = defaultProps;

export default RenderField;
