import React, { Component } from "react";
import { reset, initialize } from "redux-form";
import { Form, Col, Row, Typography, Button } from "antd";
import PropTypes from "prop-types";

import { reduxForm, Field } from "redux-form";

import { DOCUMENT_UPLOAD_FORM } from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const { Title } = Typography;

const propTypes = {
  uploadedFiles: PropTypes.arrayOf(PropTypes.any),
  application: PropTypes.string.isRequired,
  uploadFiles: PropTypes.func.isRequired
};

const defaultProps = {
  uploadedFiles: [],
};

const resetFormState = {
  uploadedFiles: [],
};

export class DocumentUploadForm extends Component {
  state = resetFormState;

  handleSubmit = (values, dispatch) => {
    const application = { json: values, documents: this.state.uploadedFiles };
    this.props.(application).then((response) => {
      this.setState(resetFormState);
      dispatch(initialize(DOCUMENT_UPLOAD_FORM));
      this.emptySavedFormData();
      // Redirect
    });
  };

  handleReset = () => {
    this.setState(resetFormState, () => this.emptySavedFormData());
  };

  onFileLoad = (document_name, object_store_path) => {
    this.setState((prevState) => ({
      uploadedFiles: [{ object_store_path, document_name }, ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (error, file) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter(
        (doc) => doc.object_store_path !== file.serverId
      ),
    }));
  };

  render() {
    return (
      <Row>
        <Col>
          <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
            <Title level={2}>Upload Required Files</Title>
            <Row gutter={48}>
              <Col span={24}>
                <Form.Item label="Upload Required Files">
                  <Field
                    id="files"
                    name="files"
                    component={renderConfig.FILE_UPLOAD}
                    acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
                    onFileLoad={this.props.onFileLoad}
                    onRemoveFile={this.props.onRemoveFile}
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

export default reduxForm({
  form: DOCUMENT_UPLOAD_FORM,
})(DocumentUploadForm);
