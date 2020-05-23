import React, { Component } from "react";
import { reset, initialize } from "redux-form";
import { Form, Col, Row, Typography, Button } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";

import PropTypes from "prop-types";

import { reduxForm, Field } from "redux-form";

import { uploadDocs } from "@/actionCreators/uploadDocumentsActionCreator";

import { renderConfig } from "@/components/common/config";
import { DOCUMENT_UPLOAD_FORM } from "@/constants/forms";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const { Title } = Typography;

const propTypes = {
  application: PropTypes.string.isRequired,
  uploadedDocs: PropTypes.arrayOf(PropTypes.any),
  uploadDocs: PropTypes.func.isRequired,
  onDocumentUpload: PropTypes.func.isRequired,
};

const defaultProps = {
  uploadedDocs: [],
};

const resetFormState = {
  uploadedDocs: [],
  submitted: false,
};

export class DocumentUploadForm extends Component {
  state = resetFormState;

  handleSubmit = (values, dispatch) => {
    event.preventDefault();
    this.props.uploadDocs(this.props.application, this.state.uploadedDocs).then((response) => {
      this.setState({ submitted: true });
      dispatch(initialize(DOCUMENT_UPLOAD_FORM));
      this.props.onDocumentUpload();
    });
  };

  handleReset = () => {
    this.setState(resetFormState, () => this.emptySavedFormData());
  };

  onFileLoad = (document_name, object_store_path) => {
    this.setState((prevState) => ({
      uploadedDocs: [{ document_name, object_store_path }, ...prevState.uploadedDocs],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedDocs: prevState.uploadedDocs.filter((doc) => doc.object_store_path !== file.serverId),
    }));
  };

  render() {
    return !this.state.submitted ? (
      <Row>
        <Col>
          <Form layout="vertical" onSubmit={this.handleSubmit} onReset={this.handleReset}>
            <Row gutter={48}>
              <Col span={24}>
                <Form.Item label="Upload Required Files">
                  <Field
                    id="files"
                    name="files"
                    component={renderConfig.FILE_UPLOAD}
                    acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
                    onFileLoad={this.onFileLoad}
                    onRemoveFile={this.onRemoveFile}
                    allowRevert
                    allowMultiple={false}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={24}>
                <Form.Item>
                  <Field
                    id="confirm_final_documents"
                    name="confirm_final_documents"
                    label="I have finished submitting all requested documents"
                    component={renderConfig.CHECKBOX}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={this.state.uploadedDocs.length === 0}
                >
                  Submit Files
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    ) : (
      <Row>
        <Col>
          <Title level={3}>Document Upload Successful</Title>
          <p>Succesfully uploaded the following documents:</p>
          <ul>
            {this.state.uploadedDocs.map((value, index) => {
              return <li key={index}>{value.document_name}</li>;
            })}
          </ul>
        </Col>
      </Row>
    );
  }
}

DocumentUploadForm.propTypes = propTypes;
DocumentUploadForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // uploadedDocuments:
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      uploadDocs,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: DOCUMENT_UPLOAD_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
  })
)(DocumentUploadForm);
