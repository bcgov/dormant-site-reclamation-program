import React, { Component } from "react";
import { reduxForm } from "redux-form";
import { Form, Button, Col, Row, Steps } from "antd";
import PropTypes from "prop-types";
import { resetForm } from "@/utils/helpers";
import * as FORM from "@/constants/forms";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

const { Step } = Steps;

export class ApplicationForm extends Component {
  state = { current: 0 };

  nextFormStep = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  };

  previousFormStep = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  steps = [
    {
      title: "Company Details",
      content: <ApplicationSectionOne />,
    },
    {
      title: "Add Sites",
      content: <ApplicationSectionTwo />,
    },
    {
      title: "Review",
      content: <ApplicationSectionThree />,
    },
  ];

  handleReset = () => {
    resetForm(FORM.APPLICATION_FORM);
  };

  render() {
    return (
      <Row>
        <Col>
          <Form layout="vertical" onSubmit={this.props.handleSubmit}>
            <Steps current={this.state.current}>
              {this.steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <Row className="steps-content">
              <Col>{this.steps[this.state.current].content}</Col>
            </Row>
            <Row className="steps-action">
              <Col>
                {this.state.current < this.steps.length - 1 && (
                  <Button type="primary" onClick={() => this.nextFormStep()}>
                    Next
                  </Button>
                )}
                {this.state.current === this.steps.length - 1 && (
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                )}
                {this.state.current > 0 && (
                  <Button style={{ margin: "0 8px" }} onClick={() => this.previousFormStep()}>
                    Previous
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    );
  }
}

ApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  onSubmitSuccess: resetForm(FORM.APPLICATION_FORM),
  touchOnBlur: false,
})(ApplicationForm);
