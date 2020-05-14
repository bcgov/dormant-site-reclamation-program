/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { isDirty } from "redux-form";
import { Col, Row, Steps } from "antd";

import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";
import APPLICATION_FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
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
      content: (
        <ApplicationSectionOne
          onSubmit={this.nextFormStep}
          onFileLoad={this.props.onFileLoad}
          onRemoveFile={this.props.onRemoveFile}
          initialValues={{ company_details: { province: "BC" } }}
        />
      ),
    },
    {
      title: "Well Sites",
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

  componentDidUpdate = () => {
    if (this.props.isDirty) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  };

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

const mapStateToProps = (state) => ({
  isDirty: isDirty(APPLICATION_FORM)(state),
});

export default connect(mapStateToProps)(ApplicationForm);
