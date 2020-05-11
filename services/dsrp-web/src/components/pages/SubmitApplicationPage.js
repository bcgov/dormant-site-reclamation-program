import React, { Component } from "react";
import { Button, Row, Col, Steps, Typography } from "antd";
import ApplicationForm from "@/components/forms/ApplicationForm";

const { Paragraph, Title } = Typography;
const { Step } = Steps;

// TEMP NOTE: Step props: description, icon, status, title, subTitle, disabled
const steps = [
  {
    title: "First",
    subTitle: "First Sub",
    content: <ApplicationForm />,
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

export class SubmitApplicationPage extends Component {
  state = {
    current: 0,
  };

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  render() {
    const { current } = this.state;

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
            <Steps current={current}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} subTitle={item.subTitle} />
              ))}
            </Steps>
            <div className="steps-content">{steps[current].content}</div>
            <div className="steps-action">
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => this.next()}>
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={() => message.success("Processing complete!")}>
                  Done
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: "0 8px" }} onClick={() => this.prev()}>
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

export default SubmitApplicationPage;
