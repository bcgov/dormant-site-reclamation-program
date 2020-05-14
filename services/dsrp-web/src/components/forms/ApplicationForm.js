import React, { Component } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Col, Row, Steps } from "antd";
import { Prompt, withRouter } from "react-router-dom";
import { isDirty } from "redux-form";

import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";
import APPLICATION_FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
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
      content: <ApplicationSectionOne onSubmit={this.nextFormStep} />,
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

  render() {
    console.log(this.props.isDirty(APPLICATION_FORM));
    return (
      <React.Fragment>
      <Prompt
        when={this.props.isDirty(APPLICATION_FORM)}
        message={(location) => {
          return this.props.location.pathname === location.pathname
            ? true
            : "You have unsaved changes. Are you sure you want to leave without saving?";
        }}
      />
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
      </React.Fragment>
    );
  }
}

ApplicationForm.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      isDirty,
    },
    dispatch
  );


export default compose(connect(null, mapDispatchToProps), withRouter)(ApplicationForm);
