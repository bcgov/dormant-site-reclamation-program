import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import RenderSelect from "@/components/common/RenderSelect";
import { fetchPermitHolders } from "@/actionCreators/OGCActionCreator";
import {
  getPermitHolders,
  getPermitHoldersDropdown,
  getPermitHoldersHash,
} from "@/selectors/OGCSelectors";

const propTypes = {
  fetchPermitHolders: PropTypes.func.isRequired,
  permitHolders: PropTypes.arrayOf(PropTypes.any),
  permitHoldersDropDown: PropTypes.arrayOf(PropTypes.any),
  permitHoldersHash: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  permitHolders: [],
  permitHoldersDropDown: [],
  permitHoldersHash: [],
};

export class PermitHolderSelect extends Component {
  componentDidMount = () => {
    this.props.fetchPermitHolders();
  };

  render = () => <RenderSelect {...this.props} data={this.props.permitHoldersDropDown} />;
}

const mapStateToProps = (state) => ({
  permitHolders: getPermitHolders(state),
  permitHoldersDropDown: getPermitHoldersDropdown(state),
  permitHoldersHash: getPermitHoldersHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermitHolders,
    },
    dispatch
  );

PermitHolderSelect.propTypes = propTypes;
PermitHolderSelect.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PermitHolderSelect);
