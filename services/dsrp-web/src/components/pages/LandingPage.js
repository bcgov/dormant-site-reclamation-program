import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button, Typography } from "antd";
import * as routes from "@/constants/routes";
import { AuthorizationGuard } from "@/hoc/AuthorizationGuard";

const { Paragraph, Text, Title } = Typography;

export const LandingPage = (props) => (
  <>
    <Row type="flex" justify="center" align="top" className="landing-header">
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title level={1}>Dormant Sites Reclamation Program</Title>
        <Paragraph>
          The Dormant Sites Reclamation Program (Program) will access $100 million of federal
          funding provided to the Province of British Columbia to clean up dormant oil and gas
          wells. The funding was established as part of the federal government’s COVID-19 Economic
          Response Plan.
        </Paragraph>
        <Paragraph>
          The Program will offer opportunities for oil and natural gas service sector contractors in
          British Columbia to apply for a financial contribution to undertake and complete work on
          dormant site reclamation.
        </Paragraph>
        <Paragraph>
          The Program will also provide Indigenous peoples, landowners and local communities in
          British Columbia the opportunity to nominate dormant sites for reclamation.
        </Paragraph>

        <Title level={4}>What you need to apply:</Title>
        <Paragraph>
          <ul className="landing-list">
            <li>Company details</li>
            <li>Company contact information</li>
          </ul>
        </Paragraph>

        <Title level={4}> For each site, contractors must provide:</Title>
        <Paragraph>
          <ul className="landing-list">
            <li>Permit holder name</li>
            <li>Well authorization number</li>

            <li>Job steps</li>
            <li>Estimated cost of every work component</li>
            <li>Confirmation of all eligibility criteria that apply to each site</li>
          </ul>
        </Paragraph>
        <br />
        <br />
        <Row type="flex" justify="center">
          <Col>
            <Button type="primary" size="large">
              <Link to={routes.SUBMIT_APPLICATION.route} style={{ textDecoration: "none" }}>
                Apply Now
              </Link>
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
);
// TODO: WHEN LAUNCH - REMOVE AuthorizationGuard()
export default AuthorizationGuard()(LandingPage);
