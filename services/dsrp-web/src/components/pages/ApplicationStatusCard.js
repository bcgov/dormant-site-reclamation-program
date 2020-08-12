import React from "react";
import { Row, Col, Typography } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { formatDateTime } from "@/utils/helpers";
import { getApplicationStatusOptionsHash } from "@/selectors/staticContentSelectors";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  application: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    company_name: PropTypes.string,
    json: PropTypes.any,
  }).isRequired,
  applicationStatusHash: PropTypes.objectOf(PropTypes.any).isRequired,
};

const description = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return (
        <Paragraph>
          Your application has been received but has not been reviewed.
          <br />
          <i>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </i>
        </Paragraph>
      );
    case "IN_PROGRESS":
      return (
        <Paragraph>
          Your application is being reviewed.
          <br />
          <i>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </i>
        </Paragraph>
      );
    case "WAIT_FOR_DOCS":
      return (
        <Paragraph>
          Your application has been reviewed. Please attach the files requested below.
          <br />
          <i>
            To see the work that has been approved for this application, please refer to the
            agreement you have been asked to sign and upload.
          </i>
        </Paragraph>
      );
    case "DOC_SUBMITTED":
      return (
        <Paragraph>
          Your documents have been received and are being reviewed.
          <br />
          <i>
            To view your application details, please refer to the email received when your
            application was originally submitted.
          </i>
        </Paragraph>
      );
    case "FIRST_PAY_APPROVED":
      return (
        <Paragraph>
          Your application has been approved and payment will be processed shortly.
        </Paragraph>
      );
    case "INTERIM_AND_FINAL_PAY_PROCESSING":
      return (
        <Paragraph>
          Your application was approved and has received its first-phase payment. Interim and
          final-phase payments for its approved work items are now able to be processed. Please see
          below for instructions on how to submit the required documents and other relevant
          information for processing and receiving the interim and final payments on your approved
          work items. Your application will remain in this status until payment for all approved and
          completed work has been received.
        </Paragraph>
      );
    case "ALL_PAYMENTS_RECEIVED":
      return (
        <Paragraph>
          Your application has received payment for all of its approved work items and its lifecycle
          is complete. Thank you! If you believe there are any outstanding issues, please contact
          us.
        </Paragraph>
      );
    case "NOT_APPROVED":
      return (
        <Paragraph>
          Your application has been rejected.
          <br />
          <i>
            Please refer to the email you received for any additional information regarding your
            application.
          </i>
        </Paragraph>
      );
    case "WITHDRAWN":
      return (
        <Paragraph>
          Your application has been withdrawn as requested.
          <br />
          <i>
            Please refer to the email you received for any additional information regarding your
            application
          </i>
        </Paragraph>
      );
    default:
      throw new Error("Unknown application status code received!");
  }
};

export const ApplicationStatusCard = (props) => (
  <Row type="flex" align="top">
    <Title level={1}>Application Progress</Title>
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <Title level={4}>Company</Title>
      <Paragraph>
        <Text strong>{props.application.company_name}</Text>
      </Paragraph>
      <Title level={4}>Received On</Title>
      <Paragraph>
        <Text strong>{formatDateTime(props.application.submission_date)}</Text>
      </Paragraph>
      <Title level={4}>Application Status</Title>
      <Paragraph>
        <Text strong>{props.applicationStatusHash[props.application.application_status_code]}</Text>
      </Paragraph>
      <Paragraph>{description(props.application.application_status_code)}</Paragraph>
      <br />
      <Paragraph>
        If you have any questions regarding your application,{" "}
        <a href="mailto:DormantSite.BC.Government@gov.bc.ca">contact us</a> and be sure to include
        your reference number.
      </Paragraph>
    </Col>
  </Row>
);

const mapStateToProps = (state) => ({
  applicationStatusHash: getApplicationStatusOptionsHash(state),
});

ApplicationStatusCard.propTypes = propTypes;

export default connect(mapStateToProps)(ApplicationStatusCard);
