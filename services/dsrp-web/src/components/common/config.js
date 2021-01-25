import RenderCheckbox from "./RenderCheckbox";
import RenderAutoSizeField from "./RenderAutoSizeField";
import RenderDate from "./RenderDate";
import RenderField from "./RenderField";
import RenderSelect from "./RenderSelect";
import RenderMultiSelect from "./RenderMultiSelect";
import FileUpload from "./FileUpload";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const renderConfig = {
  CHECKBOX: RenderCheckbox,
  AUTO_SIZE_FIELD: RenderAutoSizeField,
  DATE: RenderDate,
  FIELD: RenderField,
  SELECT: RenderSelect,
  MULTI_SELECT: RenderMultiSelect,
  FILE_UPLOAD: FileUpload,
};
