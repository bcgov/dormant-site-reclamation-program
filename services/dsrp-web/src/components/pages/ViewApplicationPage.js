/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col, Typography, Icon } from "antd";
import { reset } from "redux-form";
import { fetchApplicationByID } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import ViewOnlyApplicationForm from "@/components/forms/ViewOnlyApplicationForm";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchApplicationByID: PropTypes.func.isRequired,
  application: PropTypes.any.isRequired,
};

const defaultProps = {
  application: {},
};

const { Paragraph, Title, Text } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchApplicationByID(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <>
        {this.state.isLoaded ? (
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
        ) : (
          <div>Loading...</div>
        )}
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
      fetchApplicationByID,
      reset,
    },
    dispatch
  );

ViewApplicationPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ViewApplicationPage);
