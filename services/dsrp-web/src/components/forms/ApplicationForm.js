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
      title: "First",
      subTitle: "First Subtitle",
      content: <ApplicationSectionOne />,
    },
    {
      title: "Second",
      subTitle: "Second Subtitle",
      content: <ApplicationSectionTwo />,
    },
    {
      title: "Last",
      subTitle: "Last Subtitle",
      content: <ApplicationSectionThree />,
    },
  ];

  handleReset = () => {
    resetForm(FORM.APPLICATION_FORM);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col sm={24} className="border--right--layout">
            <Steps current={this.state.current}>
              {this.steps.map((item) => (
                <Step key={item.title} title={item.title} subTitle={item.subTitle} />
              ))}
            </Steps>
            <div className="steps-content">{this.steps[this.state.current].content}</div>
            <div className="steps-action">
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
            </div>
          </Col>
        </Row>
      </Form>
    );
  }
}

ApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  onSubmitSuccess: resetForm(FORM.APPLICATION_FORM),
  touchOnBlur: false,
})(ApplicationForm);
