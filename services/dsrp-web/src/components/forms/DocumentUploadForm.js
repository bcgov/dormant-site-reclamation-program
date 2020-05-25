import React, { Component } from "react";
import { initialize, reduxForm, Field, getFormValues } from "redux-form";
import { Form, Col, Row, Typography, Button } from "antd";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { has } from "lodash";

import PropTypes from "prop-types";

import { uploadDocs } from "@/actionCreators/uploadDocumentsActionCreator";

import { renderConfig } from "@/components/common/config";
import { DOCUMENT_UPLOAD_FORM } from "@/constants/forms";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const { Title, Text, Paragraph } = Typography;

const propTypes = {
  applicationGuid: PropTypes.string.isRequired,
  uploadedDocs: PropTypes.arrayOf(PropTypes.any),
  uploadDocs: PropTypes.func.isRequired,
  onDocumentUpload: PropTypes.func.isRequired,
  isAdminView: PropTypes.bool,
};

const defaultProps = {
  uploadedDocs: [],
  isAdminView: false,
};

const resetFormState = {
  uploadedDocs: [],
  submitted: false,
  finalDocuments: false,
};

export class DocumentUploadForm extends Component {
  state = resetFormState;

  handleSubmit = (event) => {
    event.preventDefault();
    const finalDocuments = has(this.props.formValues, "confirm_final_documents")
      ? this.props.formValues.confirm_final_documents
      : false;
    const payload = {
      documents: this.state.uploadedDocs,
      confirm_final_documents: finalDocuments,
    };
    this.props.uploadDocs(this.props.applicationGuid, payload).then(() => {
      this.setState({ submitted: true, finalDocuments });
      this.props.initialize(DOCUMENT_UPLOAD_FORM);
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
    const finalDocuments = has(this.props.formValues, "confirm_final_documents");
    const disableSubmission = this.state.uploadedDocs.length === 0 && !finalDocuments;
    return !this.state.submitted ? (
      <Row>
        <Col>
          {!this.props.isAdminView && (
            <>
              <Title level={3}>Supporting Documents</Title>
              <Text>
                You must submit the following files before any approved work can begin and your
                initial payment can be processed:
              </Text>
              <Paragraph>
                <ul className="landing-list">
                  <li>
                    A signed copy of the agreement you received from the Province of British
                    Columbia
                  </li>
                  <li>
                    A copy of the contract between your company and the permit holder named in the
                    application
                  </li>
                  <li>A certificate of insurance</li>
                </ul>
                <b>
                  NOTE: You will not see documents you may have previously uploaded for this
                  application
                </b>
              </Paragraph>
            </>
          )}
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
                {!this.props.isAdminView && (
                  <Text>
                    Your application cannot progress until you indicate that all documents have been
                    submitted
                  </Text>
                )}
                {!this.props.isAdminView && (
                  <Form.Item>
                    <Field
                      id="confirm_final_documents"
                      name="confirm_final_documents"
                      label={<b>I have finished submitting all requested documents</b>}
                      type="checkbox"
                      component={renderConfig.CHECKBOX}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                <Button type="primary" htmlType="submit" disabled={disableSubmission}>
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
          {!this.props.isAdminView && this.state.finalDocuments && (
            <p>
              Application Status has changed to <strong>Documents Submitted</strong>. You will see
              this change the next time you visit this page.
            </p>
          )}
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
  formValues: getFormValues(DOCUMENT_UPLOAD_FORM)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      uploadDocs,
      initialize,
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
