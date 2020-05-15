import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Row, Col, Form, Select, Spin, Icon, Button, Descriptions } from "antd";
import RenderField from "@/components/common/RenderField";
import { fetchSelectedWell } from "@/actionCreators/OGCActionCreator";
import { getSelectedWells } from "@/selectors/OGCSelectors";
import { throttle } from "lodash";

const propTypes = {
  fetchSelectedWell: PropTypes.func.isRequired,
  selectedWells: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const defaultProps = {};

export class WellField extends Component {
  constructor(props) {
    super(props);
    this.fetchSelectedWellThrottled = throttle(this.props.fetchSelectedWell, 2000, {
      leading: true,
      trailing: true,
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.input.value !== this.props.input.value) {
      this.fetchSelectedWellThrottled({ well_auth_number: nextProps.input.value });
    }
  };

  render = () => {
    return (
      <>
        <Row>
          <Col>
            <RenderField {...this.props} />
          </Col>
        </Row>
        <Row>
          <Col>
            {this.props.selectedWells[this.props.input.value] && (
              <Descriptions column={1} title="Well Site Details">
                <Descriptions.Item label="Well Name">
                  {this.props.selectedWells[this.props.input.value].well_name}
                </Descriptions.Item>
                <Descriptions.Item label="Operator">
                  {this.props.selectedWells[this.props.input.value].operator_name}
                </Descriptions.Item>
                <Descriptions.Item label="Current Status">
                  {this.props.selectedWells[this.props.input.value].current_status}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {this.props.selectedWells[this.props.input.value].surface_location}
                </Descriptions.Item>
                <Descriptions.Item label="Field">
                  {this.props.selectedWells[this.props.input.value].field}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Col>
        </Row>
      </>
    );
  };
}
// if (isNaN(get(values, field))) {

const mapStateToProps = (state) => ({
  selectedWells: getSelectedWells(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSelectedWell,
    },
    dispatch
  );

WellField.propTypes = propTypes;
WellField.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(WellField);
