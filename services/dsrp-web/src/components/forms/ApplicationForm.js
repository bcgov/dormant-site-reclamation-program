import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { isPristine, getFormValues, reset, initialize } from "redux-form";
import { Col, Row, Steps, Typography, Result, Icon } from "antd";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import { formatDateTimeFine } from "@/utils/helpers";
import { createApplication } from "@/actionCreators/applicationActionCreator";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import { APPLICATION_FORM } from "@/constants/forms";
import * as router from "@/constants/routes";

const { Step } = Steps;
const { Text, Title, Paragraph } = Typography;

const propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  createApplication: PropTypes.func.isRequired,
  isPristine: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  formValues: null,
};

const resetFormState = {
  currentStep: 0,
  initialValues: {},
  previouslySavedFormValues: null,
  previouslySavedFormStep: 0,
  saveTimestamp: null,
};

export class ApplicationForm extends Component {
  state = resetFormState;

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
      currentStep: this.state.currentStep || 0,
    };

    localStorage.setItem(APPLICATION_FORM, JSON.stringify(data));

    this.setState({
      saveTimestamp: data.saveTimestamp,
      previouslySavedFormValues: data.formValues,
      previouslySavedFormStep: data.currentStep || 0,
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
    const application = { json: values, documents: this.state.uploadedDocs };
    this.props.createApplication(application).then((response) => {
      this.setState(resetFormState);
      dispatch(initialize(APPLICATION_FORM));
      this.emptySavedFormData();
      this.props.history.push(router.APPLICATION_SUCCESS.dynamicRoute(response.data.guid));
    });
  };

  handleReset = () => {
    this.setState(resetFormState, () => this.emptySavedFormData());
  };

  componentDidMount() {
    const data = this.getSavedFormData();
    if (data) {
      this.setState({
        initialValues: data.formValues,
        saveTimestamp: data.saveTimestamp,
        currentStep: data.currentStep || 0,
      });
    }
    this.autoSaveForm = setInterval(() => this.saveFormData(), 1000);
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
    const steps = [
      {
        title: "Company Info",
        content: (
          <ApplicationSectionOne
            onSubmit={this.nextFormStep}
            handleReset={this.handleReset}
            initialValues={this.state.initialValues}
            fileGuid={this.state.fileGuid}
          />
        ),
      },
      {
        title: "Well Sites",
        content: (
          <ApplicationSectionTwo
            previousStep={this.previousFormStep}
            onSubmit={this.nextFormStep}
            handleReset={this.handleReset}
            initialValues={this.state.initialValues}
          />
        ),
      },
      {
        title: "Review",
        content: (
          <React.Fragment>
            <Row>
              <Col>
                <Title level={4}>Before you submit</Title>
                <Paragraph>
                  Review your application details below to make sure all information provided is
                  accurate.
                </Paragraph>
                <Paragraph>
                  <b>You will not be able to edit your application after it is submitted</b>
                </Paragraph>
                <Paragraph>
                  <ul>
                    <li>Applications can be approved in part or in their entirety</li>
                    <li>
                      Any work on well sites that does not qualify or contains errors will be
                      rejected
                    </li>
                    <li>You must re-apply for any rejected work in order to be considered again</li>
                  </ul>
                </Paragraph>
                <Title level={4}>What happens next?</Title>
                <Paragraph>Make sure the email address provided is correct!</Paragraph>
                <Paragraph>
                  After completing your application, you will receive a unique confirmation number
                  you can use to check the status of your application at any time by clicking Check
                  Application Status at the top of the page.
                </Paragraph>
                <Paragraph>
                  If any of the work applied for is approved, you will receive an agreement that you
                  must sign and upload along with:
                  <ul>
                    <li>
                      A copy of the contract between your company and the permit holder named in
                      your application
                    </li>
                    <li>A certificate of Insurance</li>
                    <li>
                      A signed copy of the agreement between your company and the Province of
                      British Columbia
                    </li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  When the files have been uploaded, you may begin work and the initial payment will
                  be processed and sent to you at the address provided.
                </Paragraph>
                <Paragraph>
                  Once approved work begins, you will be required to submit regular reports and
                  invoices documenting contributions of employees who are residents of British
                  Columbia. This information will be used to process the payments that follow.
                  Application Review
                </Paragraph>
              </Col>
            </Row>
            <Row>
              <Col>
                <ViewOnlyApplicationForm isEditable={false} noRenderStep3 />
              </Col>
            </Row>
            <ApplicationSectionThree
              previousStep={this.previousFormStep}
              onSubmit={this.handleSubmit}
              handleReset={this.handleReset}
              initialValues={this.state.initialValues}
            />
          </React.Fragment>
        ),
      },
    ];

    return (
      <Row>
        <Col>
          <div>
            <Steps current={this.state.currentStep}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <Row className="steps-content">
              <Col>{steps[this.state.currentStep || 0].content}</Col>
            </Row>
            {this.state.saveTimestamp && (
              <>
                <Icon
                  type="info-circle"
                  className="icon-lg color-primary"
                  style={{ marginRight: 8, marginTop: 24, marginLeft: 24 }}
                />
                Application progress automatically saved to your browser on&nbsp;
                <Text strong>{formatDateTimeFine(this.state.saveTimestamp)}</Text>.
              </>
            )}
          </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ApplicationForm));
