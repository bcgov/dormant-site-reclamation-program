import React, { Component } from "react";
import { bindActionCreators , compose } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Row, Col, Typography, Icon } from "antd";
import { reset } from "redux-form";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";
import { fetchApplicationById } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchApplicationById: PropTypes.func.isRequired,
  application: PropTypes.any,
};

const defaultProps = {
  application: {},
};

const { Paragraph, Title, Text } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchApplicationById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <>
        {(this.state.isLoaded && (
          <>
            <Row
              type="flex"
              justify="center"
              align="top"
              className="landing-header"
              gutter={[{ sm: 0, xl: 64 }]}
            >
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <LinkButton onClick={this.goBack}>
                  <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                  Return to Review Applications
                </LinkButton>
              </Col>
              <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
                <Title>Application ID: {this.props.application.id}</Title>
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
                <ViewOnlyApplicationForm initialValues={this.props.application.json} />
              </Col>
            </Row>
          </>
        )) || <div>Loading...</div>}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  application: getApplication(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationById,
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
