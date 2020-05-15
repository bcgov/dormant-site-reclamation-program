import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isEqual } from "lodash";
import { getFormValues, isPristine, reset } from "redux-form";
import { Row, Col, Typography } from "antd";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { APPLICATION_FORM } from "@/constants/forms";

const propTypes = {
  createApplication: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  isPristine: PropTypes.bool.isRequired,
};

const { Paragraph, Title } = Typography;

const defaultInitialValues = { company_details: { province: "BC" } };

export class SubmitApplicationPage extends Component {
  state = {
    uploadedFiles: [],
    initialValues: defaultInitialValues,
    previouslySavedFormValues: null,
    saveTimestamp: null,
  };

  saveFormData = () => {
    if (
      this.props.isPristine ||
      isEqual(this.props.formValues, this.state.previouslySavedFormValues)
    ) {
      return;
    }

    this.setState(
      (prevState) => ({
        uploadedFiles: [
          {
            ...prevState.uploadedFiles[0],
            lastModified: 1587758409223,
            lastModifiedDate: "Fri Apr 24 2020 13:00:09 GMT-0700 (Pacific Daylight Time)",
            name: "Withdrawal Letter Template (NoW)-24042020 (5).pdf",
            size: 74941,
            type: "application/pdf",
            webkitRelativePath: "",
          },
        ],
      }),
      () => {
        const saveTimestamp = new Date().getTime();
        const data = {
          initialValues: this.props.formValues,
          saveTimestamp,
          uploadedFiles: JSON.stringify(this.state.uploadedFiles),
        };
        localStorage.setItem(APPLICATION_FORM, JSON.stringify(data));

        console.log("Saving form data:", data);

        this.setState({ saveTimestamp, previouslySavedFormValues: this.props.formValues });
      }
    );
  };

  getSavedFormData = () => {
    const data = localStorage.getItem(APPLICATION_FORM);
    console.log("Get saved form data");
    return data ? JSON.parse(data) : null;
  };

  emptySavedFormData = () => {
    localStorage.setItem(APPLICATION_FORM, null);
    console.log("Emptying saved form data");
  };

  handleSubmit = (values, dispatch) => {
    const application = { json: values, documents: this.state.uploadedFiles };
    this.props.createApplication(application).then(() => {
      this.setState(
        {
          initialValues: defaultInitialValues,
          previouslySavedFormValues: null,
          saveTimestamp: null,
          uploadedFiles: [],
        },
        () => {
          this.emptySavedFormData();
          dispatch(reset(APPLICATION_FORM));
        }
      );
    });
  };

  onFileLoad = (document_name, document_manager_guid) => {
    console.log("GETTING CALLED");
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

  componentDidMount() {
    this.autoSaveForm = setInterval(() => this.saveFormData(), 1000);
  }

  componentWillMount() {
    const data = this.getSavedFormData();
    if (data) {
      this.setState(
        {
          initialValues: data.initialValues,
          saveTimestamp: data.saveTimestamp,
          uploadedFiles: JSON.parse(data.uploadedFiles),
        },
        () => console.log("WILL MOUNT STATE", this.state)
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.autoSaveForm);
  }

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
              initialValues={this.state.initialValues}
              uploadedFiles={this.state.uploadedFiles}
            />
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  formValues: getFormValues(APPLICATION_FORM)(state),
  isPristine: isPristine(APPLICATION_FORM)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createApplication,
    },
    dispatch
  );

SubmitApplicationPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(SubmitApplicationPage);
