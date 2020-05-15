import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { compose } from "redux";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
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
  state = { uploadedFiles: [] };

  handleSubmit = (values) => {
    const application = { json: values, documents: this.state.uploadedFiles };
    this.props.createApplication(application);
  };

  onFileLoad = (document_name, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [{ document_manager_guid, document_name }, ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter(
        (doc) => doc.document_manager_guid !== file.serverId
      ),
    }));
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
            <ApplicationForm
              handleSubmit={this.handleSubmit}
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
            />
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(SubmitApplicationPage);
