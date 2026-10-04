import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_IS_AUTH_LOGIN: "SET_IS_AUTH_LOGIN",
  SET_IS_AUTH_REGISTER: "SET_IS_AUTH_REGISTER",
  SET_IS_AUTH_LOGOUT: "SET_IS_AUTH_LOGOUT",
};

export function setIsAuthLoginActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_LOGIN,
    payload: { status },
  };
}

export function setIsAuthRegisterActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_REGISTER,
    payload: { status },
  };
}

export function setIsAuthLogoutActionCreator(status) {
  return {
    type: ActionType.SET_IS_AUTH_LOGOUT,
    payload: { status },
  };
}

export function asyncSetIsAuthLogin(email, password) {
  return async (dispatch) => {
    try {
      const { data } = await authApi.postLogin(email, password);
      apiHelper.putAccessToken(data.token);
      dispatch(setIsAuthLoginActionCreator(true));
      dispatch(setIsAuthLogoutActionCreator(false));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsAuthLoginActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsAuthRegister(name, email, password) {
  return async (dispatch) => {
    try {
      const { message } = await authApi.postRegister(name, email, password);
      await showSuccessDialog(message);
      dispatch(setIsAuthRegisterActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsAuthRegisterActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsAuthLogout() {
  return (dispatch) => {
    apiHelper.removeAccessToken();
    dispatch(setIsAuthLoginActionCreator(false));
    dispatch(setIsAuthLogoutActionCreator(true));
  };
}