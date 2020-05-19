import * as authenticationReducer from "@/reducers/authenticationReducer";

export const {
  isAuthenticated,
  getUserInfo,
  userLoading,
  getRedirect,
  getIsAdmin,
  getUserRoles,
  getIsViewOnly,
} = authenticationReducer;
