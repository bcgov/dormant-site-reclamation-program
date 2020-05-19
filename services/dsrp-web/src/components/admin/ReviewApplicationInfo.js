import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { getApplications, getWorkTypes } from "@/selectors/applicationSelectors";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import ApplicationTable from "@/components/admin/ApplicationTable";

const propTypes = {
  applications: PropTypes.any.isRequired,
  fetchApplications: PropTypes.func.isRequired,
};
export class ReviewApplicationInfo extends Component {
  componentDidMount() {
    this.props.fetchApplications();
  }

  render() {
    return (
      <>
        <ApplicationTable applications={this.props.applications} workTypes={this.props.workTypes} />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
  workTypes: getWorkTypes(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
    },
    dispatch
  );

ReviewApplicationInfo.propTypes = propTypes;
// ReviewApplicationInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReviewApplicationInfo);
