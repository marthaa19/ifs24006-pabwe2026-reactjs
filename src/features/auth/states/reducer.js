import { ActionType } from "./action";

export function isAuthLoginReducer(isAuthLogin = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGIN:
      return action.payload.status;
    default:
      return isAuthLogin;
  }
}

export function isAuthRegisterReducer(isAuthRegister = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_REGISTER:
      return action.payload.status;
    default:
      return isAuthRegister;
  }
}

export function isAuthLogoutReducer(isAuthLogout = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGOUT:
      return action.payload.status;
    default:
      return isAuthLogout;
  }
}