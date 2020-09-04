import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "antd";
import { closeModal } from "@/actions/modalActions";
import {
  getIsModalOpen,
  getProps,
  getContent,
  getClearOnSubmit,
  getWidth,
} from "@/selectors/modalSelectors";
import {
  getIsTimerVisible,
  getIssuedTimeUtc,
  getTimeOutSeconds,
} from "@/reducers/authorizationReducer";
import AuthorizationTimer from "@/components/common/AuthorizationTimer";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  clearOnSubmit: PropTypes.bool.isRequired,
  content: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  props: PropTypes.objectOf(PropTypes.any),
  isTimerVisible: PropTypes.bool.isRequired,
  issuedTimeUtc: PropTypes.instanceOf(Date),
  timeOutSeconds: PropTypes.number,
};

const defaultProps = {
  content: () => {},
  props: {
    title: "",
    onSubmit: () => {},
    afterClose: () => {},
  },
  timeOutSeconds: null,
  issuedTimeUtc: null,
};

export class ModalWrapper extends Component {
  constructor(props) {
    super(props);
    // Closes modal on browser forward/back actions
    window.onpopstate = this.onBrowserButtonEvent;
  }

  onBrowserButtonEvent = () => {
    this.closeModal();
  };

  closeModal = () => {
    this.props.closeModal();
    if (typeof this.props.props.afterClose === "function") {
      this.props.props.afterClose();
    }
  };

  getFooter = () =>
    this.props.isTimerVisible &&
    this.props.issuedTimeUtc &&
    this.props.timeOutSeconds && (
      <AuthorizationTimer
        issueDate={this.props.issuedTimeUtc}
        timeOut={this.props.timeOutSeconds}
        className="authorization-timer-modal"
      />
    );

  render() {
    const ChildComponent = this.props.content;
    return (
      <Modal
        title={this.props.props.title}
        visible={this.props.isModalOpen}
        width={this.props.width}
        footer={this.getFooter()}
        closable={false}
      >
        {ChildComponent && (
          <ChildComponent
            closeModal={this.closeModal}
            clearOnSubmit={this.props.clearOnSubmit}
            {...this.props.props}
          />
        )}
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  isModalOpen: getIsModalOpen(state),
  props: getProps(state),
  content: getContent(state),
  clearOnSubmit: getClearOnSubmit(state),
  width: getWidth(state),
  isTimerVisible: getIsTimerVisible(state),
  issuedTimeUtc: getIssuedTimeUtc(state),
  timeOutSeconds: getTimeOutSeconds(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeModal,
    },
    dispatch
  );

ModalWrapper.propTypes = propTypes;
ModalWrapper.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ModalWrapper);
