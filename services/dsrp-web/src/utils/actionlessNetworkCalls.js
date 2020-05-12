import CustomAxios from "../customAxios";
import { createRequestHeader } from "./requestHeaders";
import { ENVIRONMENT } from "../constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL, DOCUMENT_MANAGER_TOKEN_GET_URL } from "../constants/api";

export const downloadFileFromDocumentManager = ({ document_manager_guid, document_name = "" }) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      if (document_name.toLowerCase().includes(".pdf")) {
        window.open(`${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`, "_blank");
      } else {
        window.location = `${ENVIRONMENT.docManUrl + DOCUMENT_MANAGER_FILE_GET_URL(token)}`;
      }
    });
};

export const getDocumentDownloadToken = (document_manager_guid, filename, URLArray) => {
  if (!document_manager_guid) {
    throw new Error("Must provide document_manager_guid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_TOKEN_GET_URL(document_manager_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      const URL = `${`${ENVIRONMENT.docManUrl +
        DOCUMENT_MANAGER_FILE_GET_URL(token)}&as_attachment=true`}`;
      URLArray.push({ filename, url: URL });
    });
};
