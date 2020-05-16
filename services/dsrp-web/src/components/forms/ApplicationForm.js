import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isPristine, getFormValues, reset, initialize } from "redux-form";
import { Col, Row, Steps, Typography, Result } from "antd";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import { formatDateTimeFine } from "@/utils/helpers";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import { APPLICATION_FORM } from "@/constants/forms";

const { Step } = Steps;
const { Text, Title, Paragraph } = Typography;

const propTypes = {
  createApplication: PropTypes.func.isRequired,
  isPristine: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  formValues: null,
};

export class ApplicationForm extends Component {
  state = {
    currentStep: 0,
    initialValues: {},
    previouslySavedFormValues: null,
    previouslySavedFormStep: 0,
    saveTimestamp: null,
  };

  nextFormStep = () => {
    const currentStep = this.state.currentStep + 1;
    this.setState({ currentStep }, () => this.saveFormData());
    window.scrollTo(0, 0);
  };

  previousFormStep = () => {
    const currentStep = this.state.currentStep - 1;
    this.setState({ currentStep }, () => this.saveFormData());
    window.scrollTo(0, 0);
  };

  saveFormData() {
    if (
      (this.props.isPristine ||
        isEqual(this.props.formValues, this.state.previouslySavedFormValues)) &&
      this.state.currentStep === this.state.previouslySavedFormStep
    ) {
      return;
    }

    const data = {
      formValues: this.props.formValues,
      saveTimestamp: new Date().getTime(),
      currentStep: this.state.currentStep,
    };

    localStorage.setItem(APPLICATION_FORM, JSON.stringify(data));

    this.setState({
      saveTimestamp: data.saveTimestamp,
      previouslySavedFormValues: data.formValues,
      previouslySavedFormStep: data.currentStep,
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
    const application = { json: values };
    this.props.createApplication(application).then(() => {
      this.setState(
        {
          submitSuccess: true,
          initialValues: {},
          previouslySavedFormValues: null,
          previouslySavedFormStep: 0,
          saveTimestamp: null,
          currentStep: 0,
        },
        () => {
          dispatch(initialize(APPLICATION_FORM, {}));
          dispatch(reset(APPLICATION_FORM));
          this.emptySavedFormData();
        }
      );
    });
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
        currentStep: data.currentStep,
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.autoSaveForm);
    this.saveFormData();
  }

  componentDidUpdate = () => {
    if (!this.props.isPristine) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  };

  render() {
    const extraActions = this.state.saveTimestamp && (
      <Text style={{ float: "right" }}>
        Application progress automatically saved to this device on&nbsp;
        <Text strong>{formatDateTimeFine(this.state.saveTimestamp)}</Text>.
      </Text>
    );

    const steps = [
      {
        title: "Company Info",
        content: (
          <ApplicationSectionOne
            onSubmit={this.nextFormStep}
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
          <>
            <Title level={3}>Review Application</Title>
            <Paragraph>
              Please review your application below and confirm that its information is correct.
            </Paragraph>
            <Row gutter={48}>
              <Col>
                <ViewOnlyApplicationForm
                  isEditable={false}
                  initialValues={this.props.formValues}
                  noRenderStep3
                />
              </Col>
            </Row>
            <ApplicationSectionThree
              previousStep={this.previousFormStep}
              onSubmit={this.handleSubmit}
              initialValues={this.state.initialValues}
              extraActions={extraActions}
            />
          </>
        ),
      },
    ];

    return (
      <Row>
        <Col>
          {/* // TODO: Render application submission success (or other) feedback here. */}
          {(this.state.submitSuccess && (
            <Result status="success" title="Successfully Submitted Application!" />
          )) || (
            <>
              <Steps current={this.state.currentStep}>
                {steps.map((item) => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
              <Row className="steps-content">
                <Col>{steps[this.state.currentStep].content}</Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    );
  }
}

ApplicationForm.propTypes = propTypes;
ApplicationForm.defaultProps = defaultProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationForm);
