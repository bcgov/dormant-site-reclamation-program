import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationForm from "@/components/forms/ApplicationForm";

const propTypes = {
  createApplication: PropTypes.func.isRequired,
};

const { Paragraph, Title } = Typography;

export class SubmitApplicationPage extends Component {
  handleSubmit = (values) => {
    console.log("handleSubmit", values);

    // TODO: Process form values appropriately.
    const newValues = values;

    const application = { json: newValues };
    this.props.createApplication(application);
  };

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
            <ApplicationForm onSubmit={this.handleSubmit} />
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
