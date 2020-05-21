import CustomAxios from "../customAxios";
import { createRequestHeader } from "./requestHeaders";
import { ENVIRONMENT } from "../constants/environment";
import { APPLICATION_DOCUMENT } from "../constants/api";

export const downloadApplicationDocument = (application_guid, document_guid) => {
  CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl + APPLICATION_DOCUMENT(application_guid)}/${document_guid}`,
      createRequestHeader()
    )
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file.pdf"); //or any other extension
      document.body.appendChild(link);
      link.click();
    });
};
