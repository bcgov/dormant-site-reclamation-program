import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isDirty, getFormValues, reset } from "redux-form";
import { Col, Row, Steps, Typography } from "antd";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import { formatDateTimeFine } from "@/utils/helpers";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";
import { APPLICATION_FORM } from "@/constants/forms";

const { Step } = Steps;
const { Text } = Typography;

const propTypes = {
  createApplication: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  isDirty: PropTypes.bool.isRequired,
};

const defaultProps = {
  formValues: null,
};

const defaultInitialValues = { company_details: { province: "BC" } };

export class ApplicationForm extends Component {
  state = {
    currentStep: 0,
    uploadedFiles: [],
    initialValues: defaultInitialValues,
    previouslySavedFormValues: null,
    saveTimestamp: null,
  };

  nextFormStep = () => {
    const currentStep = this.state.currentStep + 1;
    this.setState({ currentStep });
    window.scrollTo(0, 0);
  };

  previousFormStep = () => {
    const currentStep = this.state.currentStep - 1;
    this.setState({ currentStep });
    window.scrollTo(0, 0);
  };

  saveFormData() {
    if (
      !this.props.isDirty ||
      isEqual(this.props.formValues, this.state.previouslySavedFormValues)
    ) {
      return;
    }

    const data = {
      formValues: this.props.formValues,
      saveTimestamp: new Date().getTime(),
    };

    localStorage.setItem(APPLICATION_FORM, JSON.stringify(data));

    this.setState({
      saveTimestamp: data.saveTimestamp,
      previouslySavedFormValues: data.formValues,
    });
  }

  getSavedFormData() {
    const data = localStorage.getItem(APPLICATION_FORM);
    return data ? JSON.parse(data) : null;
  }

  emptySavedFormData() {
    localStorage.setItem(APPLICATION_FORM, null);
  }

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
      this.setState({
        initialValues: data.formValues,
        saveTimestamp: data.saveTimestamp,
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.autoSaveForm);
    this.saveFormData();
  }

  componentDidUpdate = () => {
    if (this.props.isDirty) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  };

  render() {
    const extraActions = (this.state.saveTimestamp && (
      <Text style={{ float: "right" }}>
        Application progress automatically saved to this device on&nbsp;
        <Text strong>{formatDateTimeFine(this.state.saveTimestamp)}</Text>.
      </Text>
    )) || <></>;

    const steps = [
      {
        title: "Company Info",
        content: (
          <ApplicationSectionOne
            onSubmit={this.nextFormStep}
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            initialValues={this.state.initialValues}
            extraActions={extraActions}
          />
        ),
      },
      {
        title: "Well Sites",
        content: (
          <ApplicationSectionTwo
            previousStep={this.previousFormStep}
            onSubmit={this.nextFormStep}
            initialValues={this.state.initialValues}
            extraActions={extraActions}
          />
        ),
      },
      {
        title: "Review",
        content: (
          <ApplicationSectionThree
            previousStep={this.previousFormStep}
            onSubmit={this.handleSubmit}
            initialValues={this.state.initialValues}
            extraActions={extraActions}
          />
        ),
      },
    ];

    return (
      <Row>
        <Col>
          <Steps current={this.state.currentStep}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <Row className="steps-content">
            <Col>{steps[this.state.currentStep].content}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

ApplicationForm.propTypes = propTypes;
ApplicationForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formValues: getFormValues(APPLICATION_FORM)(state),
  isDirty: isDirty(APPLICATION_FORM)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createApplication,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationForm);
