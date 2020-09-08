import React from "react";
import { reduxForm, Field } from "redux-form";
import { Row, Col, Form, Button } from "antd";
import PropTypes from "prop-types";
import Paragraph from "antd/lib/typography/Paragraph";
import { renderConfig } from "@/components/common/config";
import { required, exactLength } from "@/utils/validate";
import { guidMask } from "@/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  endUserTemporarySession: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  initialValues: {},
};

const ViewApplicationStatusForm = (props) => (
  <Form
    layout="vertical"
    onSubmit={(data) => {
      props.endUserTemporarySession();
      props.handleSubmit(data);
    }}
  >
    <Paragraph>
      To View your application, enter your application reference number and request a one-time use
      link. This link is valid for four hours after the request is made. If you need to access the
      application again, enter the reference number and request a new link.
    </Paragraph>
    <Row gutter={48}>
      <Col>
        <Field
          id="guid"
          name="guid"
          label="Application Reference Number"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          component={renderConfig.FIELD}
          validate={[required, exactLength(36)]}
          {...guidMask}
        />
        <Button type="primary" htmlType="submit" loading={props.submitting}>
          Request Link
        </Button>
      </Col>
    </Row>
    <Row className="steps-action">
      <Col />
    </Row>
  </Form>
);

ViewApplicationStatusForm.propTypes = propTypes;
ViewApplicationStatusForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.VIEW_APPLICATION_STATUS_FORM,
  enableReinitialize: true,
})(ViewApplicationStatusForm);
