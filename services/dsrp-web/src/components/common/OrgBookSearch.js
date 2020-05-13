import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Select, Spin, Icon } from "antd";
import debounce from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { searchOrgBook } from "@/actionCreators/orgbookActionCreator";
import { getSearchOrgBookResults } from "@/selectors/orgbookSelectors";

const propTypes = {
  searchOrgBook: PropTypes.func.isRequired,
  searchOrgBookResults: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
  searchOrgBookResults: [],
  orgBookCredential: {},
};

export class OrgBookSearch extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.handleSearchDebounced = (value) => debounce(this.handleSearch(value), 1000);
  }

  state = {
    options: [],
    credential: null,
    isSearching: false,
    isAssociating: false,
  };

  handleChange = () => {
    this.setState({
      isSearching: false,
    });
  };

  handleSearch(search) {
    if (search.length === 0) {
      return;
    }

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ options: [], isSearching: true, credential: null });

    this.props.searchOrgBook(search).then(() => {
      if (fetchId !== this.lastFetchId) {
        return;
      }

      const selectOptions = this.props.searchOrgBookResults
        .filter((result) => result.names && result.names.length > 0)
        .map((result) => ({
          text: result.names[0].text,
          value: result.names[0].credential_id,
        }));
      this.setState({ options: selectOptions, isSearching: false });
    });
  }

  render() {
    return (
      <Row gutter={48} type="flex" align="middle">
        <Col span={24}>
          <Form.Item label={this.props.label}
            validateStatus={
              this.props.meta.touched ? (this.props.meta.error && "error") || (this.props.meta.warning && "warning") : ""
            }
            help={
              this.props.meta.touched &&
              ((this.props.meta.error && <span>{this.props.meta.error}</span>) ||
                (this.props.meta.warning && <span>{this.props.meta.warning}</span>))
            }>
            <Select
              showSearch
              showArrow
              placeholder="Start typing to search OrgBook..."
              notFoundContent={
                this.state.isSearching ? (
                  <Spin size="small" indicator={<Icon type="loading" />} />
                ) : null
              }
              filterOption={false}
              onSearch={this.handleSearchDebounced}
              onChange={this.handleChange}
              disabled={this.state.isAssociating}
              {...this.props.input}
            >
              {this.state.options.map((option) => (
                <Select.Option key={option.value} value={option.text}>{option.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  searchOrgBookResults: getSearchOrgBookResults(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      searchOrgBook,
    },
    dispatch
  );

OrgBookSearch.propTypes = propTypes;
OrgBookSearch.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(OrgBookSearch);
