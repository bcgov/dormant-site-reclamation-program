/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import { fetchApplicationByID } from "@/actionCreators/applicationActionCreator";
import { getApplication } from "@/selectors/applicationSelectors";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  fetchApplicationByID: PropTypes.func.isRequired,
  application: PropTypes.any.isRequired,
};

const { Paragraph, Title } = Typography;

export class ViewApplicationPage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchApplicationByID(id).then(() => {
      this.setState({ isLoaded: true });
    });
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
            <Title>Application: {this.props.application.application_status_code || "-"}</Title>
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
          {this.state.isLoaded ? (
            <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
              <ApplicationSectionOne viewOnly initialValues={this.props.application} />
              <ApplicationSectionTwo viewOnly initialValues={this.props.application} />
              <ApplicationSectionThree viewOnly initialValues={this.props.application} />
            </Col>
          ) : (
            <div>Loading ....</div>
          )}
        </Row>
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
    },
    dispatch
  );

ViewApplicationPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ViewApplicationPage);
