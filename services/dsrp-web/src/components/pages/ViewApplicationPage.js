import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { reset, getFormValues } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Typography, Icon, Tabs, Button } from "antd";
import { openModal } from "@/actions/modalActions";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import { fetchApplicationById, updateApplication } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import ViewApplicationDocuments from "@/components/pages/ViewApplicationDocuments";
import LinkButton from "@/components/common/LinkButton";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
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
  application: PropTypes.any,
  editedApplication: PropTypes.any,
};

const defaultProps = {
  application: {},
  editedApplication: {},
};

const { Title } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false, editApplication: false };

  componentDidMount() {
    this.handleGetApplication();
  }

  goBack = () => {
    this.props.history.goBack();
  };

  handleGetApplication = () => {
    const { id } = this.props.match.params;
    return this.props.fetchApplicationById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleAdminEditApplicationButtonClick = () => {
    if (this.state.editApplication) {
      this.openAdminEditApplicationModal();
      return;
    }
    this.setState({ editApplication: true });
  };

  afterCloseAdminEditApplicationModal = () => {
    this.setState({ editApplication: false }, () => this.props.reset(FORM.APPLICATION_FORM));
  };

  openAdminEditApplicationModal = () => {
    return this.props.openModal({
      props: {
        title: "Edit Application",
        onSubmit: this.handleAdminEditApplication,
        afterClose: this.afterCloseAdminEditApplicationModal,
        application: this.props.application,
      },
      content: modalConfig.ADMIN_EDIT_APPLICATION,
    });
  };

  handleAdminEditApplication = (guid, values) => {
    const payload = {
      edit_note: values.edit_note,
      json: this.props.editedApplication,
    };
    return this.props.updateApplication(guid, payload);
  };

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
                  Return to Review Applications
                </LinkButton>
              </Col>
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Title>Application Reference Number: {this.props.application.guid}</Title>
              </Col>
            </Row>
            <Row type="flex" justify="center" align="top" className="landing-header">
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Tabs type="card">
                  <TabPane tab="Application" key="1" style={{ padding: "20px" }}>
                    <Button
                      type="primary"
                      onClick={this.handleAdminEditApplicationButtonClick}
                      style={{ display: "block" }}
                    >
                      <Icon type="edit" className="icon-lg" />
                      {(this.state.editApplication && "Finish Editing") || "Enter Edit Mode"}
                    </Button>
                    <ViewOnlyApplicationForm
                      isViewingSubmission
                      initialValues={this.props.application.json}
                      isAdminEditMode={this.state.editApplication}
                    />
                  </TabPane>
                  <TabPane
                    tab={`Documents (${this.props.application.documents.length})`}
                    key="2"
                    style={{ padding: "20px" }}
                  >
                    <ViewApplicationDocuments
                      application_guid={this.props.application.guid}
                      documents={this.props.application.documents}
                    />
                    <DocumentUploadForm
                      applicationGuid={this.props.application.guid}
                      isAdminView
                      onDocumentUpload={this.handleGetApplication}
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationById,
      updateApplication,
      openModal,
      reset,
    },
    dispatch
  );

ViewApplicationPage.propTypes = propTypes;
ViewApplicationPage.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  AuthorizationGuard()
)(ViewApplicationPage);
