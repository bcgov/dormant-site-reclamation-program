import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { reset, getFormValues } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Typography, Icon, Tabs, Button } from "antd";
import { openModal, closeModal } from "@/actions/modalActions";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import {
  fetchApplicationById,
  updateApplication,
  deleteApplicationPaymentDocument,
} from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import { getApplicationDocumentTypeOptionsHash } from "@/selectors/staticContentSelectors";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import ViewApplicationDocuments from "@/components/pages/ViewApplicationDocuments";
import LinkButton from "@/components/common/LinkButton";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import ViewPaymentDocuments from "@/components/pages/ViewPaymentDocuments";
import Loading from "@/components/common/Loading";
import { modalConfig } from "@/components/modalContent/config";
import { PageTracker } from "@/utils/trackers";
import * as FORM from "@/constants/forms";

const { TabPane } = Tabs;
const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchApplicationById: PropTypes.func.isRequired,
  updateApplication: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  deleteApplicationPaymentDocument: PropTypes.func.isRequired,
  applicationDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.any).isRequired,
  closeModal: PropTypes.func.isRequired,
  /* eslint-disable */
  history: PropTypes.any.isRequired,
  application: PropTypes.any,
  editedApplication: PropTypes.any,
  /* eslint-enable */
};

const defaultProps = {
  application: {},
  editedApplication: {},
};

const { Title } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false, editApplication: false, activeTab: "application" };

  componentDidMount() {
    this.handleGetApplication();
  }

  goBack = () => {
    this.props.history.goBack();
  };

  handleGetApplication = () => {
    this.setState({ isLoaded: false });
    const { id } = this.props.match.params;
    return this.props.fetchApplicationById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleSubmitAdminEditApplicationButtonClick = () => {
    if (this.state.editApplication) {
      this.openAdminEditApplicationModal();
      return;
    }
    this.setState({ editApplication: true });
  };

  handleDiscardAdminEditApplication = () => {
    this.setState({ editApplication: false }, () => {
      this.props.reset(FORM.ADMIN_EDIT_APPLICATION_FORM);
      this.props.reset(FORM.APPLICATION_FORM);
    });
  };

  handleResumeAdminEditApplication = () => {
    this.props.closeModal();
  };

  openAdminEditApplicationModal = () => {
    return this.props.openModal({
      props: {
        title: "Edit Application",
        onSubmit: this.handleSubmitAdminEditApplication,
        afterClose: this.handleDiscardAdminEditApplication,
        handleResume: this.handleResumeAdminEditApplication,
        application: this.props.application,
      },
      content: modalConfig.ADMIN_EDIT_APPLICATION,
    });
  };

  handleSubmitAdminEditApplication = (guid, values) => {
    // TODO: Verify with FORM.APPLICATION_FORM validation function(s).
    const payload = {
      edit_note: values.edit_note,
      json: this.props.editedApplication,
    };
    return this.props
      .updateApplication(guid, payload)
      .then(() => this.props.closeModal())
      .then(() => this.handleGetApplication())
      .then(() => this.handleDiscardAdminEditApplication());
  };

  handleDeletePaymentDocument = (appGuid, documentGuid) => {
    this.props
      .deleteApplicationPaymentDocument(appGuid, documentGuid)
      .then(() => this.props.closeModal())
      .then(() => this.handleGetApplication());
  };

  renderAdminEditButton = () => (
    <Button
      type="primary"
      onClick={this.handleSubmitAdminEditApplicationButtonClick}
      style={{ display: "block" }}
      disabled={!this.state.isLoaded}
    >
      <Icon type="edit" className="icon-lg" />
      {(this.state.editApplication && "Finish Editing") || "Edit Application"}
    </Button>
  );

  handleTabClick = (key) => this.setState({ activeTab: key });

  render() {
    return (
      <>
        {(this.state.isLoaded && (
          <>
            <PageTracker title="View Application" />
            <Row type="flex" justify="center" align="top" className="landing-header">
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <LinkButton onClick={this.goBack}>
                  <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                  Return to Previous Page
                </LinkButton>
              </Col>
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Title>Application Reference Number: {this.props.application.guid}</Title>
              </Col>
            </Row>
            <Row type="flex" justify="center" align="top" className="landing-header">
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Tabs type="card" activeKey={this.state.activeTab} onTabClick={this.handleTabClick}>
                  <TabPane tab="Application" key="application" style={{ padding: "20px" }}>
                    {this.renderAdminEditButton()}
                    <ViewOnlyApplicationForm
                      isViewingSubmission
                      applicationPhaseCode={this.props.application.application_phase_code}
                      initialValues={this.props.application.json}
                      isAdminEditMode={this.state.editApplication}
                    />
                    {this.renderAdminEditButton()}
                  </TabPane>
                  <TabPane
                    tab={`Documents (${this.props.application.documents.length})`}
                    key="application_documents"
                    style={{ padding: "20px" }}
                  >
                    <ViewApplicationDocuments
                      applicationDocumentTypeOptionsHash={
                        this.props.applicationDocumentTypeOptionsHash
                      }
                      applicationGuid={this.props.application.guid}
                      documents={this.props.application.documents}
                    />
                    <DocumentUploadForm
                      applicationGuid={this.props.application.guid}
                      isAdminView
                      onDocumentUpload={this.handleGetApplication}
                    />
                  </TabPane>
                  <TabPane
                    tab={`Payment Request Forms (${this.props.application.payment_documents.length})`}
                    key="payment_documents"
                    style={{ padding: "20px" }}
                  >
                    <ViewPaymentDocuments
                      application_guid={this.props.application.guid}
                      documents={this.props.application.payment_documents}
                      onDocumentDelete={this.handleDeletePaymentDocument}
                    />
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </>
        )) || <Loading />}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  application: getApplication(state),
  editedApplication: getFormValues(FORM.APPLICATION_FORM)(state),
  applicationDocumentTypeOptionsHash: getApplicationDocumentTypeOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationById,
      updateApplication,
      openModal,
      closeModal,
      reset,
      deleteApplicationPaymentDocument,
    },
    dispatch
  );

ViewApplicationPage.propTypes = propTypes;
ViewApplicationPage.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationPage);
