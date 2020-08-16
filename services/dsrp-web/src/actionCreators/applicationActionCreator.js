import { notification } from "antd";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/api";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as applicationActions from "@/actions/applicationActions";
import CustomAxios from "../customAxios";

export const createApplication = (application) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_APPLICATION));
  const payload = { application };
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.APPLICATION(), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Application submitted",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_APPLICATION));
      throw new Error(err);
    });
};

export const fetchApplications = (params) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATIONS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION(params), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATIONS));
      dispatch(applicationActions.storeApplications(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_APPLICATIONS));
      throw new Error(err);
    });
};

export const fetchApplicationById = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION_BY_ID(guid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION));
      dispatch(applicationActions.storeApplication(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_APPLICATION));
      throw new Error(err);
    });
};

export const fetchApplicationSummaryById = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION_SUMMARY));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.APPLICATION_SUMMARY_BY_ID(guid), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION_SUMMARY));
      dispatch(applicationActions.storeApplication(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_APPLICATION_SUMMARY));
      throw new Error(err);
    });
};

export const updateApplication = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APPLICATION));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.APPLICATION_BY_ID(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Application edited successfully",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_APPLICATION));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_APPLICATION));
      throw new Error(err);
    });
};

export const updateApplicationReview = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_APPLICATION_REVIEW));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.APPLICATION_REVIEW(guid), payload, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.UPDATE_APPLICATION_REVIEW));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_APPLICATION_REVIEW));
      throw new Error(err);
    });
};

export const createApplicationStatus = (guid, payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_APPLICATION_STATUS));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.STATUS(guid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated status of the application and informed applicant via email",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_APPLICATION_STATUS));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_APPLICATION_STATUS));
      throw new Error(err);
    });
};

export const deleteApplicationPaymentDocument = (appGuid, documentGuid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_APPLICATION_PAYMENT_DOCUMENT));
  return CustomAxios()
    .delete(
      ENVIRONMENT.apiUrl + API.APPLICATION_PAYMENT_DOCUMENT(appGuid, documentGuid),
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Payment document deleted successfully",
        duration: 5,
      });
      dispatch(success(reducerTypes.DELETE_APPLICATION_PAYMENT_DOCUMENT));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_APPLICATION_PAYMENT_DOCUMENT));
      throw new Error(err);
    });
};

export const fetchApplicationApprovedContractedWorkById = (guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION_APPROVED_CONTRACTED_WORK));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl + API.APPLICATION_APPROVED_CONTRACTED_WORK_BY_ID(guid),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION_APPROVED_CONTRACTED_WORK));
      dispatch(applicationActions.storeApplicationApprovedContractedWork(response.data));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_APPLICATION_APPROVED_CONTRACTED_WORK));
      throw new Error(err);
    });
};

export const updateContractedWorkPaymentInterim = (applicationGuid, workId, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM(applicationGuid, workId),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Contracted work interim payment information updated successfully",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_INTERIM));
      throw new Error(err);
    });
};

export const updateContractedWorkPaymentFinal = (applicationGuid, workId, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_FINAL));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.UPDATE_CONTRACTED_WORK_PAYMENT_FINAL(applicationGuid, workId),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Contracted work final payment information updated successfully",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_FINAL));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.UPDATE_CONTRACTED_WORK_PAYMENT_FINAL));
      throw new Error(err);
    });
};

export const createContractedWorkPaymentStatus = (applicationGuid, workId, payload) => (
  dispatch
) => {
  dispatch(request(reducerTypes.CREATE_CONTRACTED_WORK_PAYMENT_STATUS));
  return CustomAxios()
    .put(
      ENVIRONMENT.apiUrl + API.CREATE_CONTRACTED_WORK_PAYMENT_STATUS(applicationGuid, workId),
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Contracted work status updated successfully",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_CONTRACTED_WORK_PAYMENT_STATUS));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_CONTRACTED_WORK_PAYMENT_STATUS));
      throw new Error(err);
    });
};
