import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Row, Col, Form, Select, Spin, Icon, Button, Input, Descriptions } from "antd";
import { debounce } from "lodash";
import RenderField from "@/components/common/RenderField";
import { fetchSelectedWell } from "@/actionCreators/OGCActionCreator";
import { getSelectedWells } from "@/selectors/OGCSelectors";

const propTypes = {
  fetchSelectedWell: PropTypes.func.isRequired,
  selectedWells: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const defaultProps = {};

export class WellField extends Component {
  constructor(props) {
    super(props);
    this.fetchSelectedWellThrottled = debounce(this.props.fetchSelectedWell, 1000);
  }

  handleSearch(search) {
    if (search.length === 0) {
      return;
    }

    this.fetchSelectedWellThrottled({ well_auth_number: search });
  }

  render() {
    return (
      <>
        <Row>
          <Col>
            <Input onChange={(e) => this.handleSearch(e.target.value)} />
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
  }
}

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
