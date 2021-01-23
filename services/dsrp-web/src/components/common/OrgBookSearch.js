import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Select, Spin, Icon, Button, Descriptions } from "antd";
import { isEmpty, debounce } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { searchOrgBook, fetchOrgBookCredential } from "@/actionCreators/orgbookActionCreator";
import { getSearchOrgBookResults, getOrgBookCredential } from "@/selectors/orgbookSelectors";
import { ORGBOOK_ENTITY_URL, ORGBOOK_CREDENTIAL_URL } from "@/constants/routes";
import { formatDateTime } from "@/utils/helpers";

const propTypes = {
  searchOrgBook: PropTypes.func.isRequired,
  fetchOrgBookCredential: PropTypes.func.isRequired,
  searchOrgBookResults: PropTypes.arrayOf(PropTypes.any),
  orgBookCredential: PropTypes.objectOf(PropTypes.any),
  disabled: PropTypes.bool,
};

const defaultProps = {
  searchOrgBookResults: [],
  orgBookCredential: {},
  disabled: false,
};

export class OrgBookSearch extends Component {
  constructor(props) {
    super(props);
    this.searchOrgBookDebounced = debounce(this.props.searchOrgBook, 2000);
  }

  state = {
    options: [],
    isSearching: false,
  };

  handleChange = () => {
    this.setState({
      isSearching: false,
    });
  };

  handleSelect = (value) => {
    const credentialId = value.key;
    this.props.fetchOrgBookCredential(credentialId);
  };

  handleSearch(search) {
    if (search.length === 0) {
      return;
    }

    this.setState({
      options: [],
      isSearching: true,
    });

    this.searchOrgBookDebounced(search);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.input.value !== this.props.input.value &&
      isEmpty(nextProps.orgBookCredential) &&
      !isEmpty(nextProps.input.value)
    ) {
      this.handleSelect(nextProps.input.value);
    }

    if (nextProps.searchOrgBookResults !== this.props.searchOrgBookResults) {
      const selectOptions = nextProps.searchOrgBookResults
        .filter((result) => result.names && result.names.length > 0)
        .map((result) => ({
          text: result.names[0].text,
          value: result.names[0].credential_id,
        }));
      this.setState({ options: selectOptions, isSearching: false });
    }
  }

  render() {
    const hasOrgBookCredential =
      !isEmpty(this.props.orgBookCredential) && !isEmpty(this.props.input.value);
    const isInputDisabled = this.props.disabled;

    return (
      <Row>
        <Col>
          <Form.Item
            label={this.props.label}
            validateStatus={
              this.props.meta.touched || this.props.meta.submitFailed
                ? (this.props.meta.error && "error") || (this.props.meta.warning && "warning")
                : ""
            }
            help={
              (this.props.meta.touched || this.props.meta.submitFailed) &&
              ((this.props.meta.error && <span>{this.props.meta.error}</span>) ||
                (this.props.meta.warning && <span>{this.props.meta.warning}</span>))
            }
          >
            <Select
              showSearch
              showArrow
              placeholder="Start typing to search BC Registries for your company name..."
              notFoundContent={
                this.state.isSearching ? (
                  <Spin size="small" indicator={<Icon type="loading" />} />
                ) : null
              }
              labelInValue
              filterOption={false}
              onSearch={(value) => this.handleSearch(value)}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              disabled={isInputDisabled}
              {...this.props.input}
            >
              {this.state.options.map((option) => (
                <Select.Option key={option.value}>{option.text}</Select.Option>
              ))}
            </Select>
            {hasOrgBookCredential && (
              <>
                <br />
                <br />
                <Descriptions title="Company Details from BC Registries" column={1}>
                  <Descriptions.Item label="Registration Name">
                    {this.props.orgBookCredential.names[0].text}
                  </Descriptions.Item>
                  <Descriptions.Item label="Registration ID">
                    <a
                      href={ORGBOOK_ENTITY_URL(this.props.orgBookCredential.topic.source_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {this.props.orgBookCredential.topic.source_id}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="Registration Status">
                    {this.props.orgBookCredential.inactive ? "Inactive" : "Active"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Registration Date">
                    {formatDateTime(this.props.orgBookCredential.effective_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Latest Credential">
                    <a
                      href={ORGBOOK_CREDENTIAL_URL(
                        this.props.orgBookCredential.topic.source_id,
                        this.props.orgBookCredential.id
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {this.props.orgBookCredential.id}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item>
                    <Button
                      type="primary"
                      href={
                        hasOrgBookCredential
                          ? ORGBOOK_ENTITY_URL(this.props.orgBookCredential.topic.source_id)
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
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Form.Item>
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

OrgBookSearch.propTypes = propTypes;
OrgBookSearch.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(OrgBookSearch);
