import React from "react";
import { Row, Col, Typography, Result, Icon } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { formatDateTime } from "@/utils/helpers";
import { getApplicationStatusOptionsHash } from "@/selectors/staticContentSelectors";

const { Paragraph } = Typography;

const propTypes = {
  application: PropTypes.shape({
    guid: PropTypes.string,
    application_status_code: PropTypes.string,
    submission_date: PropTypes.string,
    json: PropTypes.any,
  }).isRequired,
};

export const ApplicationStatusCard = (props) => (
  <Row type="flex" justify="center" align="top" className="landing-header">
    <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
      <Result
        icon={<Icon type="info-circle" theme="twoTone" />}
        title={`Application Status: ${
          props.applicationStatusHash[props.application.application_status_code]
        }`}
      />
      <Typography>
        <Paragraph>Received On: {formatDateTime(props.application.submission_date)}</Paragraph>
      </Typography>
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
