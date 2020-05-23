import React from "react";
import { Row, Col, Typography, Result, Icon } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { formatDateTime } from "@/utils/helpers";
import { getApplicationStatusOptionsHash } from "@/selectors/staticContentSelectors";

const { Paragraph, Title } = Typography;

const propTypes = {
  application: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    json: PropTypes.any,
  }).isRequired,
};

const description = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return (
        <>
          <Paragraph>Your application has been received but has not been reviewed.</Paragraph>
          <Paragraph>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </Paragraph>
        </>
      );
    case "IN_PROGRESS":
      return (
        <>
          <Paragraph>Your application is being reviewed.</Paragraph>
          <Paragraph>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </Paragraph>
        </>
      );
    case "WAIT_FOR_DOCS":
      return (
        <>
          <Paragraph>
            Your application has been reviewed. Please attach the files requested below.
          </Paragraph>
          <Paragraph>
            To see the work that has been approved for this application, please refer to the
            agreement you have been asked to sign and upload.
          </Paragraph>
        </>
      );
    case "DOC_SUBMITTED":
      return (
        <>
          <Paragraph>Your documents have been received and are being reviewed.</Paragraph>
          <Paragraph>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </Paragraph>
        </>
      );
    case "FIRST_PAY_APPROVED":
      return (
        <>
          <Paragraph>
            Your application has been approved and payment will be processed shortly.
          </Paragraph>
        </>
      );
    case "REJECTED":
      return (
        <>
          <Paragraph>Your application has been rejected.</Paragraph>
          <Paragraph>
            Please refer to the email you received for any additional information regarding your
            application.
          </Paragraph>
        </>
      );
    case "WITHDRAWN":
      return (
        <>
          <Paragraph>Your application has been withdrawn as requested.</Paragraph>
          <Paragraph>
            Please refer to the email you received for any additional information regarding your
            application
          </Paragraph>
        </>
      );
    default:
  }
};

export const ApplicationStatusCard = (props) => (
  <Row type="flex" align="top" className="landing-header">
    <Title level={1}>Application Progress</Title>
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <Title level={4}>Received On</Title>
      <Paragraph>{formatDateTime(props.application.submission_date)}</Paragraph>
      <Title level={4}>Application Status</Title>
      <Paragraph>
        {props.applicationStatusHash[props.application.application_status_code]}
      </Paragraph>
      <Paragraph>{description(props.application.application_status_code)}</Paragraph>
      <Paragraph>
        If you have any questions regarding your application,{" "}
        <a href="mailto:DormantSite.BC.Government@gov.bc.ca">Contact us</a> and be sure to include
        your reference number
      </Paragraph>
    </Col>
  </Row>
);

const mapStateToProps = (state) => ({
  applicationStatusHash: getApplicationStatusOptionsHash(state),
});

ApplicationStatusCard.propTypes = propTypes;

export default connect(mapStateToProps)(ApplicationStatusCard);
