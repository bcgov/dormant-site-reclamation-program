import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Row, Col, Form, Select, Spin, Icon, Button, Descriptions } from "antd";
import RenderField from "@/components/common/RenderField";
import { fetchWells } from "@/actionCreators/OGCActionCreator";
import { getWells } from "@/selectors/OGCSelectors";

const propTypes = {
  fetchWells: PropTypes.func.isRequired,
  wells: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const defaultProps = {};

export class WellField extends Component {
  state = {
    well_auth_number: undefined,
  };

  handleChange = (e, newValue) => {
    alert(newValue);
    //this.props.fetchWells()
  };

  render = () => (
    <>
      <Row>
        <Col>
          <RenderField {...this.props} onBlur={this.handleChange} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Descriptions column={1} title="Well Site Details">
            <Descriptions.Item label="Name">N/A</Descriptions.Item>
            <Descriptions.Item label="Operator">N/A</Descriptions.Item>
            <Descriptions.Item label="Location">N/A</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </>
  );
}
// if (isNaN(get(values, field))) {

const mapStateToProps = (state) => ({
  wells: getWells(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWells,
    },
    dispatch
  );

WellField.propTypes = propTypes;
WellField.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(WellField);
