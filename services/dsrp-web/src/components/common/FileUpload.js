import React from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import "filepond-polyfill";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import tus from "tus-js-client";
import { ENVIRONMENT } from "@/constants/environment";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

const propTypes = {
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  maxFileSize: PropTypes.string,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string),
  onFileLoad: PropTypes.func,
  onRemoveFile: PropTypes.func,
  allowRevert: PropTypes.bool,
  allowMultiple: PropTypes.bool,
  chunkSize: PropTypes.number,
  labelIdle: PropTypes.string,
  renderAfterInput: PropTypes.func,
};

const defaultProps = {
  maxFileSize: "750MB",
  acceptedFileTypesMap: {},
  allowRevert: false,
  allowMultiple: true,
  onFileLoad: () => {},
  onRemoveFile: () => {},
  chunkSize: 1048576, // 1MB
  labelIdle: "Drag & Drop your files or Browse",
  renderAfterInput: () => <></>,
};

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.server = {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const upload = new tus.Upload(file, {
          endpoint: ENVIRONMENT.docManUrl,
          retryDelays: [100, 1000, 3000],
          removeFingerprintOnSuccess: true,
          chunkSize: this.props.chunkSize,
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError: (err) => {
            error(err);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            progress(true, bytesUploaded, bytesTotal);
          },
          onSuccess: (e) => {
            const key = `dsrp-applications/${
              upload.url
                .split("/")
                .pop()
                .split("+")[0]
            }`;
            load(key);
            this.handleFileLoad(file.name, key);
          },
        });
        upload.start();
        return {
          abort: () => {
            upload.abort();
            abort();
          },
        };
      },
    };
  }

  handleFileLoad = (filename, key) => {
    const files = [{ filename, key }, ...this.props.input.value];
    this.props.onFileLoad(filename, key);
    this.props.input.onChange(files);
  };

  handleRemoveFile = (error, removedFile) => {
    const files = this.props.input.value.filter((file) => file.key !== removedFile.serverId);
    this.props.onRemoveFile(error, removedFile);
    this.props.input.onChange(files);
  };

  render() {
    const acceptedFileTypes = Object.keys(this.props.acceptedFileTypesMap);

    return (
      <Form.Item
        label={this.props.label}
        validateStatus={
          this.props.meta.touched
            ? (this.props.meta.error && "error") || (this.props.meta.warning && "warning")
            : ""
        }
        help={
          this.props.meta.touched &&
          ((this.props.meta.error && <span>{this.props.meta.error}</span>) ||
            (this.props.meta.warning && <span>{this.props.meta.warning}</span>))
        }
        labelCol={this.props.labelCol}
        wrapperCol={this.props.wrapperCol}
        labelAlign={this.props.labelAlign}
        style={this.props.style}
        className={this.props.disabled ? "disabled" : ""}
      >
        <FilePond
          server={this.server}
          id={this.props.id}
          name={this.props.name}
          disabled={this.props.disabled}
          {...this.props.input}
          labelIdle={this.props.labelIdle}
          allowRevert={this.props.allowRevert}
          onremovefile={this.handleRemoveFile}
          allowMultiple={this.props.allowMultiple}
          maxFileSize={this.props.maxFileSize}
          allowFileTypeValidation={acceptedFileTypes.length > 0}
          acceptedFileTypes={acceptedFileTypes}
          fileValidateTypeLabelExpectedTypesMap={this.props.acceptedFileTypesMap}
        />
        {this.props.renderAfterInput()}
      </Form.Item>
    );
  }
}

FileUpload.propTypes = propTypes;
FileUpload.defaultProps = defaultProps;

export default FileUpload;
