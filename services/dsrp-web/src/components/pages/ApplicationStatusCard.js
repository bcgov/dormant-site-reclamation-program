import React from "react";
import { Row, Col, Typography } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { formatDateTime } from "@/utils/helpers";
import { getApplicationStatusOptionsHash } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  application: CustomPropTypes.applicationSummary.isRequired,
  applicationStatusHash: PropTypes.objectOf(PropTypes.any).isRequired,
};

const StatusDescription = (props) => (
  <Paragraph>
    {props.description}
    <br />
    <i>
      {props.sub ||
        "To view your application details, please refer to the email you received when your application was originally submitted."}
    </i>
  </Paragraph>
);

const description = (status) => {
  switch (status) {
    case "NOT_STARTED":
      return (
        <StatusDescription description="Your application has been received but has not been reviewed." />
      );
    case "IN_PROGRESS":
      return <StatusDescription description="Your application is being reviewed." />;
    case "WAIT_FOR_DOCS":
      return (
        <StatusDescription
          description="Your application has been reviewed. Please attach the files requested below."
          sub="To see the work that has been approved for this application, please refer to the
        agreement you have been asked to sign and upload."
        />
      );
    case "DOC_SUBMITTED":
      return (
        <StatusDescription description="Your documents have been received and are being reviewed." />
      );
    case "FIRST_PAY_APPROVED":
      return (
        <StatusDescription description="Your application has been approved and the first payment will be issued. You can manage the information required to process interim and final payments below." />
      );
    case "NOT_APPROVED":
      return <StatusDescription description="Your application has been rejected." />;
    case "WITHDRAWN":
      return <StatusDescription description="Your application has been withdrawn as requested." />;
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
        If you have any questions regarding your application,&nbsp;
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
