import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Select, Spin, Icon, Button } from "antd";
import debounce, { isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { searchOrgBook, fetchOrgBookCredential } from "@/actionCreators/orgbookActionCreator";
import { getSearchOrgBookResults, getOrgBookCredential } from "@/selectors/orgbookSelectors";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";

const propTypes = {
  searchOrgBook: PropTypes.func.isRequired,
  fetchOrgBookCredential: PropTypes.func.isRequired,
  searchOrgBookResults: PropTypes.arrayOf(PropTypes.any),
  orgBookCredential: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  searchOrgBookResults: [],
  orgBookCredential: {},
};

export class PartyOrgBookForm extends Component {
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

  handleSelect = (value) => {
    const credentialId = value.key;
    this.props.fetchOrgBookCredential(credentialId).then(() => {
      this.setState({ credential: this.props.orgBookCredential });
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
    const hasOrgBookCredential = !isEmpty(this.state.credential);

    return (
      <Row gutter={48} type="flex" align="middle">
        <Col span={18}>
          <Form.Item label={this.props.label}>
            <Select
              showSearch
              showArrow
              labelInValue
              placeholder="Start typing to search OrgBook..."
              notFoundContent={
                this.state.isSearching ? (
                  <Spin size="small" indicator={<Icon type="loading" />} />
                ) : null
              }
              filterOption={false}
              onSearch={this.handleSearchDebounced}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              style={{ width: "100%" }}
              disabled={this.state.isAssociating}
            >
              {this.state.options.map((option) => (
                <Select.Option key={option.value}>{option.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Button
            type="primary"
            href={
              hasOrgBookCredential
                ? ORGBOOK_ENTITY_URL(this.state.credential.topic.source_id)
                : null
            }
            target="_blank"
            disabled={!hasOrgBookCredential}
          >
            <span>
              <Icon type="book" style={{ paddingRight: 5 }} />
              View on OrgBook
            </span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  searchOrgBookResults: getSearchOrgBookResults(state),
  orgBookCredential: getOrgBookCredential(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      searchOrgBook,
      fetchOrgBookCredential,
    },
    dispatch
  );

PartyOrgBookForm.propTypes = propTypes;
PartyOrgBookForm.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyOrgBookForm);
