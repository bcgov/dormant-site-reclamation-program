import CustomAxios from "../customAxios";
import { createRequestHeader } from "./requestHeaders";
import { ENVIRONMENT } from "../constants/environment";
import { GET_TOKEN_FOR_DOC, GET_FILE_WITH_TOKEN } from "../constants/api";

export const downloadFileFromDocumentManager = (
  application_guid,
  application_document_guid,
  document_name = ""
) => {
  if (!(application_guid || application_document_guid)) {
    throw new Error("Must provide document_manager_guid");
  }

  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + GET_TOKEN_FOR_DOC(application_guid, application_document_guid)}`,
      createRequestHeader()
    )
    .then((response) => {
      const token = { token: response.data.token_guid };
      if (document_name.toLowerCase().includes(".pdf")) {
        window.open(`${ENVIRONMENT.apiUrl + GET_FILE_WITH_TOKEN(token)}`, "_blank");
      } else {
        window.location = `${ENVIRONMENT.apiUrl + GET_FILE_WITH_TOKEN(token)}`;
      }
    });
};
