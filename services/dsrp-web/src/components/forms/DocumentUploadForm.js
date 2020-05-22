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
};

const defaultProps = {
  uploadedDocs: [],
};

const resetFormState = {
  uploadedDocs: [],
};

export class DocumentUploadForm extends Component {
  state = resetFormState;

  handleSubmit = (values, dispatch) => {
    event.preventDefault();
    this.props.uploadDocs(this.props.application, this.state.uploadedDocs).then((response) => {
      this.setState(resetFormState);
      dispatch(initialize(APPLICATION_FORM));
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
    return (
      <Row>
        <Col>
          <Form layout="vertical" onSubmit={this.handleSubmit} onReset={this.handleReset}>
            <Title level={3}>Upload Required Files</Title>
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
            <Row>
              <Col>
                <Button type="primary" htmlType="submit">
                  Submit Files
                </Button>
              </Col>
            </Row>
          </Form>
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
