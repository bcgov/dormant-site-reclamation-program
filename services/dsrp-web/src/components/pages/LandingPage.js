import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Row, Col, Button, Typography } from "antd";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import { isAuthenticated } from "@/selectors/authenticationSelectors";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
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
        <Title level={4}>What is the Dormant Sites Reclamation Program:</Title>
        <Paragraph>
          The Dormant Sites Reclamation Program (Program) will access $100 million of federal
          funding provided to British Columbia through the Inactive and Orphan Well Fund – a fund
          established through the federal government’s COVID-19 Economic Response Plan. The Program
          will offer opportunities for contractors in British Columbia to apply for shared cost
          arrangement money to complete work on dormant site reclamation. The Program will also
          provide Indigenous peoples, landowners and local communities the opportunity to nominate
          dormant sites for reclamation.
        </Paragraph>

        <Paragraph strong>Key Outcomes:</Paragraph>

        <ul className="landing-list">
          <li>
            Funding is provided to British Columbia’s oil and gas field service companies and
            contractors
          </li>
          <li>Jobs are maintained and created for British Columbians</li>
          <li>Priority sites for British Columbians are reclaimed and restored</li>
          <li>Work is accelerated on reclamation of dormant oil and gas sites</li>
          <li>Environmental liability in the Province of British Columbia is reduced</li>
        </ul>

        <Paragraph strong>Funding:</Paragraph>

        <ul className="landing-list">
          <li>$100 million in shared cost arrangements offered in two increments of $50 million</li>
          <li>Contractors with approved shared cost arrangements will receive:</li>
          <ul>
            <li>10% of the contract amount once their application is approved</li>
            <li>Up to another 60% after submitting interim invoicing and reports </li>
            <li>
              The remainder of the shared cost arrangement when the work is completed subject to
              compliance review.
            </li>
          </ul>
          <li>The Program will conclude operations in 2021/2022.</li>
        </ul>

        <Paragraph strong>Funding Increments:</Paragraph>

        <ul className="landing-list">
          <li>
            Shared cost arrangement funding will be available in two increments with targeted
            priorities, application criteria, and timelines.
          </li>
        </ul>

        <Title level={4} className="landing-subheader">
          Who is Eligible:
        </Title>
        <Paragraph>
          The Program is open to oil and gas field service companies and contractors based in
          British Columbia, with registration, office and operations in British Columbia.
        </Paragraph>

        <Paragraph strong>Eiliglble Applicants Include:</Paragraph>

        <ul className="landing-list">
          <li>Oil field services contractors who do work such as:</li>
          <ul>
            <li>Upstream oil and gas infrastructure abandonment including:</li>
            <ul>
              <li>wellsite abandonment</li>
              <li>pipeline abandonment</li>
              <li>pipeline segment removal</li>
              <li>facility abandonment</li>
            </ul>
          </ul>
          <li>Environmental contractors who do work such as:</li>
          <ul>
            <li>
              Stage 1 Preliminary Site Investigations (PSI) and Stage 2 Detailed Site Investigations
              (DSI) environmental site assessments
            </li>
            <li>Remediation</li>
            <li>Reclamation</li>
          </ul>
        </ul>

        <Paragraph>
          The company responsible for doing the contracted work must apply for the shared cost
          arrangement. Contractors and consultants may not apply on behalf of others.
        </Paragraph>

        <Title level={4} className="landing-subheader">
          What is needed to Apply:
        </Title>
        <Paragraph>
          The Program is open to oil and gas field service companies and contractors based in
          British Columbia, with registration, office and operations in British Columbia.
        </Paragraph>
        <Paragraph>
          The oil and gas sites identified in the program of work must be located in British
          Columbia and put British Columbians to work. Oil and gas field service companies and
          contractors must have a valid contract with a British Columbian oil and gas activity
          permit holder.
        </Paragraph>
        <ul>
          <li>The contract must be fully executed, with no ‘subject to’ clauses.</li>
          <li>
            Only the contractor who has signed the agreement with the permit holder can apply.
          </li>
          <li>
            Shared cost arrangement funding will be awarded only to the contractor, not the permit
            holder.
          </li>
          <li>
            The contractor is responsible for ensuring that the payment of applicable municipal
            taxes relating to an applied-for site are in good standing
          </li>
          <li>
            The permit holder is responsible for ensuring the contractor has the skills, expertise,
            capacity and equipment to conduct the work to meet all provincial requirements.
          </li>
        </ul>
        <Paragraph>
          Contractors must provide job steps, estimated costs, and outcomes for activities for each
          site (see Initial Estimate of Schedule and Expense below), and each site must have proof
          that it meets one or more of the priority criteria.
        </Paragraph>
        <Paragraph>
          Contractors must provide the number of hours worked and the number of British Columbians
          employed for that contract period when submitting interim and final invoice requirements.
        </Paragraph>
        <Paragraph>
          All laws, regulations, directives, environmental and occupational health and safety
          standards, including social distancing and COVID-19 related health guidelines must be
          followed in carrying out the work.
        </Paragraph>

        <Paragraph strong>Eligible Activities:</Paragraph>

        <ul className="landing-list">
          <li>Closure work on inactive wells and facilities</li>
          <li>Environmental site assessments (PSI and DSI)</li>
          <li>Remediation</li>
          <li>Reclamation</li>
          <li>Preparation of applications for remediation and reclamation certificates</li>
        </ul>

        <Paragraph strong>Ineligible Activities:</Paragraph>

        <ul className="landing-list">
          <li>
            suspension (wells and facilities) and discontinuation (pipelines) costs that are not
            part of abandonment and reclamation projects
          </li>
          <li>non-closure work on producing sites (for example, spill remediation)</li>
          <li>closure work outside of British Columbia</li>
          <li>
            closure work on orphan and legacy sites (these sites have separate funding streams)
          </li>
          <li>work completed before the program comes into effect on May 19, 2020</li>
        </ul>

        <br />
        <br />
        <Row type="flex" justify="center">
          <Col>
            <Button type="primary" size="large">
              <Link to={routes.SUBMIT_APPLICATION.route}>Apply</Link>
            </Button>
          </Col>
        </Row>

        <Title level={4} className="landing-subheader">
          Additional Program Details:
        </Title>
        <Paragraph strong>First increment $50 M - May 10 to May 31, 2020:</Paragraph>
        <ul>
          <li>
            Applies to oil and gas well sites and facility sites needing abandonment, contaminated
            sites investigation and/or reclamation across British Columbia
          </li>
          <li>
            Shared cost arrangements of up to $100,000 (per application, per closure activity) to be
            awarded to eligible contractors.
          </li>
          <li>
            Projects will be selected on a first come, first serve basis and must address sites with
            one or more <em>priority criteria:</em>
          </li>
          <ul>
            <li>
              Sites with priority location criteria (including lands designated Treaty Land
              Entitlement areas, residential areas, Agricultural Land Reserve, range tenure,
              hunting, trapping and gathering activities, winter-only access, and high public use
              areas)
            </li>
            <li>
              Sites with environmental priorities (including sites in close proximity to
              waterbodies, sensitive habitats, sites with suspected or known offsite contamination)
            </li>
          </ul>
        </ul>

        <Paragraph strong>
          Second increment $50M – July 01 to August 31 (may also including any funding not awarded
          in first increment):
        </Paragraph>
        <ul>
          <li>Oil and gas sites needing abandonment and/or reclamation across British Columbia</li>
          <li>Contracts of up to $100,000 (per application, per closure activity)</li>
          <li>Applications that include Nominated Sites will have priority for funding</li>
          <li>
            Criteria may be established to give priority to geographic regions that were
            underrepresented in the First Increment.
          </li>
        </ul>

        <Paragraph strong>Site Nomination Period (open May 10 – May 31):</Paragraph>
        <Paragraph>
          Indigenous communities, landowners and local governments may nominate through an on-line
          process specific dormant sites (Nominated Sites) on their territory/property/district for
          priority consideration for reclamation under the Program. Sites are required to be
          nominated by an online Nomination Form.
        </Paragraph>
        <Paragraph>
          Contractor applications that include Nominated Sites in their program of work in Increment
          #2 will be given priority for funding.
        </Paragraph>
        <Paragraph>
          Permit holders responsible for the Dormant Site will receive notification that the site is
          a Nominated Site under the program and will determine if the site work will be advanced to
          a contractor. Contractors submitting shared cost arrangement applications in Increment #2
          must identify when a site is a Nominated Site in order to be prioritized.
        </Paragraph>

        <Paragraph strong>Eligible Costs:</Paragraph>
        <Paragraph>
          All costs associated with completing the work are eligible for shared cost arrangement
          funding, including:
        </Paragraph>
        <ul>
          <li>Materials and supplies</li>
          <li>Wages</li>
          <li>Equipment rentals</li>
          <li>Laboratory analyses</li>
          <li>Transportation of equipment and workers to and from sites</li>
          <li>Camp and lodging costs for remote sites</li>
        </ul>

        <Paragraph strong>Ineligible Costs:</Paragraph>
        <ul>
          <li>Administration fees</li>
          <li>
            Costs of work to prepare for contract bids, shared cost arrangement applications and
            project contracts
          </li>
          <ul>
            <li>Similar costs not directly incurred in relation to eligible closure activities</li>
          </ul>
          <li>Food, beverages and other non-work-related expenses</li>
          <li>Costs relating to emergency spill response</li>
        </ul>

        <Paragraph strong>Initial Estimate of Schedule and Expense:</Paragraph>
        <ul>
          <li>
            To become an Eligible Recipient, a contracts and work agreements dictating a schedule
            and initial estimate of expenses will be developed between the permit holder and the
            service providers and approved by the permit holder.
          </li>
          <li>
            Prior to starting Eligible Activities, the Eligible Recipient will submit the initial
            estimate of schedule (the “Schedule”) and an initial estimate of expenses (the
            “Expenses”) approved by the Permit Holder. Eligible Recipients will work directly with
            permit holders to get the Schedule and Expenses certified so that they can qualify for
            the Program. Development of contracts will follow each permit holder’s procurement
            policies, practices, and strategies.
          </li>
        </ul>

        <Paragraph strong>Administration:</Paragraph>
        <ul>
          <li>
            The Program will be administered by the Ministry of Energy, Mines and Petroleum
            Resources (MEMPR) Oil and Gas Division, Regulatory and Infrastructure Branch.
          </li>
          <li>
            MEMPR has full discretion to determine applicant eligibility, approve applications,
            determine eligible funding, and decline incomplete or inaccurate applications under the
            Program.
          </li>
          <li>
            Successful applicants must sign a Shared Cost Arrangement Agreement (prior to receiving
            Part 2 and 3 funding)
          </li>
          <li>
            Applications, information and reports must be submitted as the timelines outlined in the
            program guidelines and shared cost arrangement agreement
          </li>
          <li>
            All shared cost arrangements administered under the Program may be subject to provincial
            audit.
          </li>
          <li>
            Final funding will be subject to completion of work outlined in the terms of the Shared
            Cost Arrangement Agreement.
          </li>
          <li>
            Any information obtained under the Program Shared Cost Arrangement Agreement will be
            subject to the provisions of FOIPPA.{" "}
          </li>
          <li>
            Program applications and the reported results of the scope of work under the Program
            Shared Cost Arrangement Agreement may be shared with the BCOGC to verify site location,
            work required and completed and compliance with Shared Cost Arrangement Agreement.
          </li>
          <li>
            Program results will be published annually. Applicant name (company), permit holder,
            shared cost arrangement amount, facility location, and aggregate data on payment and
            performance measures may be published.{" "}
          </li>
        </ul>

        <Paragraph strong>Regulatory Compliance:</Paragraph>
        <ul>
          <li>
            Permit holder’s have their own site management and health and safety requirements for
            all contractors and personnel on their locations. As the sites are still in the care and
            control of each individual permit holder, service provider oversight in the field will
            come from the permit holders themselves.
          </li>
          <li>
            The BCOGC will apply all elements of British Columbia’s existing regulatory framework as
            it applies to oil and gas activities in BC to work performed under this Program. This
            includes all required permits, notices and consultation associated with the work.
          </li>
        </ul>
      </Col>
    </Row>
  </>
);

LandingPage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  isAuthenticated: isAuthenticated(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
