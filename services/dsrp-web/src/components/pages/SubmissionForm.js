import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import PropTypes from "prop-types";

import { required, dateNotInFuture, maxLength } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import { createSubmission } from "@/actionCreators/submissionActionCreator";
import RedirectRoute from "@/routes/routeWrappers/RedirectRoute";

import * as routes from "@/constants/routes";
import * as FORM from "@/constants/forms";

/**
 * @class ReturnPage - handles all re-routing back and forth from Keycloak/SSO while following the standard login/logout paths by clicking buttons on the UI
 * CORE/IDIR users bypass this page and authenticate through the AuthenticationGuard.js without any user input
 */

export class SubmissionForm extends Component {
  state = { redirect: false, submitting: false };

  static propTypes = {
    createSubmission: PropTypes.func.isRequired,
  };

  handleSubmit = (values) => {
    this.props.createSubmission(values).then(this.setState({ redirect: true }));
  };

  cancelForm = () => {
    resetForm(FORM.GRANT_APPLICATION_FORM);
    this.setState({ redirect: true });
  };

  render() {
    if (!this.state.redirect) {
      console.log("at the form.");
      console.log(`${this.state.redirect}`);
      return (
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <Row gutter={48}>
            <Col md={12} sm={24} className="border--right--layout">
              <Form.Item>
                <Field
                  id="name"
                  name="name"
                  label="Name"
                  placeholder="Type"
                  component={renderConfig.FIELD}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id="permit_no"
                  name="permit_no"
                  label="Permit number*"
                  component={renderConfig.FIELD}
                  validate={[required, maxLength(9)]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id="issue_date"
                  name="issue_date"
                  label="Issue date*"
                  component={renderConfig.DATE}
                  validate={[required, dateNotInFuture]}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="right center-mobile">
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to cancel?"
              onConfirm={() => {
                this.cancelForm();
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="secondary">
                Cancel
              </Button>
            </Popconfirm>
            <Button
              className="full-mobile"
              type="primary"
              htmlType="submit"
              disabled={this.state.submitting}
            >
              Submit
            </Button>
          </div>
        </Form>
      );
    }
    if (this.state.redirect) {
      console.log(`at the redirect: ${this.state.redirect}`);
      return <Redirect push to={routes.HOME.route} />;
    }
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createSubmission,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.GRANT_APPLICATION_FORM,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.GRANT_APPLICATION_FORM),
  })
)(SubmissionForm);
