import React, { Component } from "react";
import { Button, Col, Row, Steps, Form } from "antd";
import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

const { Step } = Steps;

export class ApplicationForm extends Component {
  state = { current: 1 };

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
      content: <ApplicationSectionOne onSubmit={this.nextFormStep} />,
    },
    {
      title: "Add Sites",
      content: (
        <ApplicationSectionTwo previousStep={this.previousFormStep} onSubmit={this.nextFormStep} />
      ),
    },
    {
      title: "Review",
      content: (
        <ApplicationSectionThree
          previousStep={this.previousFormStep}
          onSubmit={this.props.handleSubmit}
        />
      ),
    },
  ];

  render() {
    return (
      <Row>
        <Col>
          <Steps current={this.state.current}>
            {this.steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <Row className="steps-content">
            <Col>{this.steps[this.state.current].content}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

ApplicationForm.propTypes = propTypes;

export default ApplicationForm;
