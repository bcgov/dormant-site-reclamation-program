import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Typography } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@/constants/strings";
import * as ENV from "@/constants/environment";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import * as routes from "@/constants/routes";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

const testAPICall = () => {
  console.log("test");
};

export const LandingPage = (props) => (
  <>
    <Row
      type="flex"
      justify="center"
      align="top"
      className="landing-header"
      gutter={[{ sm: 0, xl: 64 }]}
    >
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Welcome to Dormant Site Reclamation Program</Title>
        <Paragraph className="header-text">
          Manage applications, see inspection histories, get ducks, and more.
        </Paragraph>
        <Link to={routes.SUBMISSION_FORM.route}>
          <Button>Submit Proposal</Button>
        </Link>
      </Col>
    </Row>
    <Row
      gutter={[{ sm: 0, xl: 64 }]}
      type="flex"
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Title level={4}>What is Dormant Site Reclamation Program?</Title>
        <Paragraph>
          The <Text strong>Ministry of Energy, Mines and Petroleum Resources</Text> is developing a
          system to make it easier for the public, industry and government to see what&apos;s
          happening in the mining industry across British Columbia. The system is called&nbsp;
          <Text strong>Duck Services (DUCK)</Text>.
        </Paragraph>
        <Paragraph>
          <Text strong>Dormant Site Reclamation Program</Text> is part of the DUCK system, developed
          specifically for industry. It is intended to make it easier for businesses to manage
          applications, see their inspection history and submit reports.
        </Paragraph>
        <Paragraph>
          This system is being developed iteratively and with input from people who operate mines
          across B.C.
        </Paragraph>

        <Title level={4}>What can I do in Dormant Site Reclamation Program?</Title>
        <ul className="landing-list">
          <li>Upload any report specified in the Health, Safety and Reclamation Code</li>
          <li>View all code variances granted to and incidents reported by your mine</li>
          <li>View your mine permit and amendment history</li>
          <li>See all the contacts the Ministry has on file for your mine</li>
          <li>Find important Ministry contacts</li>
        </ul>
        <Paragraph />
      </Col>
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Title level={4}>How do I get access?</Title>
        <Paragraph>
          You must have a <Text strong>Business or Personal BCeID</Text> and then contact us to
          request access to Dormant Site Reclamation Program.
        </Paragraph>
        <Paragraph strong>If you have a BCeID:</Paragraph>
        <Paragraph>
          Contact us at&nbsp;
          <a href={`mailto:${Strings.HELP_EMAIL}`}>{Strings.HELP_EMAIL}</a>
          &nbsp;to request access to Dormant Site Reclamation Program.
        </Paragraph>
        <Paragraph strong>
          If you have multiple employees who need to use Dormant Site Reclamation Program:
        </Paragraph>

        <Paragraph>
          <Text>Add them to your Business BCeID</Text>
          <Text>
            Let us know you want them to be able to access Dormant Site Reclamation Program
          </Text>
        </Paragraph>

        <Title level={4}>Don&apos;t have a BCeID?</Title>
        <Paragraph>
          In order to access Dormant Site Reclamation Program, you need to register for a Business
          or Personal BCeID. It can take several weeks to process the request, so give yourself
          plenty of lead time.
        </Paragraph>
        <Paragraph>
          Once you have your BCeID, you can add employees and delegates. You can request that anyone
          added to your Business BCeID account be given access to Dormant Site Reclamation Program.
        </Paragraph>
        <Row type="flex" justify="center">
          <Col>
            <a
              href="https://www.bceid.ca/register/business/getting_started/getting_started.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="primary" size="large">
                Get a BCeID
              </Button>
            </a>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row
      gutter={[{ sm: 0, xl: 64 }]}
      type="flex"
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Card title="Questions?">
          <Row>
            <Col>
              <Paragraph>
                Please let us know about any questions or comments you have regarding your
                experience using Dormant Site Reclamation Program.
              </Paragraph>
              <Paragraph>
                Email us at&nbsp;
                <a href={`mailto:${Strings.HELP_EMAIL}`}>{Strings.HELP_EMAIL}</a>.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  </>
);

const mapStateToProps = (state) => ({
  isAuthenticated: isAuthenticated(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

LandingPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
