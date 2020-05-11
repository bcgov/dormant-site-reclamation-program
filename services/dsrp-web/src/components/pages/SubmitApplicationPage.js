import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Row, Col, Steps, Typography } from "antd";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationForm from "@/components/forms/ApplicationForm";

const propTypes = {
  createApplication: PropTypes.func.isRequired,
};

const { Paragraph, Title } = Typography;
const { Step } = Steps;

export class SubmitApplicationPage extends Component {
  state = {
    current: 0,
  };

  nextFormStep = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  };

  previousFormStep = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  handleSubmit = (values) => {
    console.log("handleSubmit", values);

    // TODO: Process form values appropriately.
    const newValues = values;

    const application = { json: newValues };
    this.props.createApplication(application);
  };

  steps = [
    {
      title: "First",
      subTitle: "First Sub",
      // WIP of course!
      content: <ApplicationForm onSubmit={this.handleSubmit} />,
    },
    {
      title: "Second",
      subTitle: "Second Sub",
      content: "Second-content",
    },
    {
      title: "Last",
      subTitle: "Last Sub",
      content: "Last-content",
    },
  ];

  render() {
    return (
      <>
        <Row
          type="flex"
          justify="center"
          align="top"
          className="landing-header"
          gutter={[{ sm: 0, xl: 64 }]}
        >
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
            <Title>Submit Application</Title>
            <Paragraph>
              Duis dictum quam vel dictum sollicitudin. Suspendisse potenti. Mauris convallis eget
              urna vitae dapibus. Etiam volutpat, metus aliquam sollicitudin aliquet, diam dui
              lacinia odio, id tempor purus libero ut orci.
            </Paragraph>
          </Col>
        </Row>
        <Row
          gutter={[{ sm: 0, xl: 64 }]}
          type="flex"
          justify="center"
          align="top"
          className="landing-section"
        >
          <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
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
                <Button type="primary" onClick={() => {}}>
                  Done
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
      </>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createApplication,
    },
    dispatch
  );

SubmitApplicationPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(SubmitApplicationPage);
