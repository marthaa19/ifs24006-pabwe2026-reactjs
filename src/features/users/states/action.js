import userApi from "../api/userApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { asyncSetIsAuthLogout } from "../../auth/states/action";

export const ActionType = {
  SET_USERS: "SET_USERS",
  SET_USER: "SET_USER",
  SET_PROFILE: "SET_PROFILE",
  SET_IS_PROFILE: "SET_IS_PROFILE",
  SET_IS_CHANGE_PROFILE: "SET_IS_CHANGE_PROFILE",
  SET_IS_CHANGE_PROFILE_PHOTO: "SET_IS_CHANGE_PROFILE_PHOTO",
  SET_IS_CHANGE_PROFILE_PASSWORD: "SET_IS_CHANGE_PROFILE_PASSWORD",
};

export function setUsersActionCreator(users) {
  return { type: ActionType.SET_USERS, payload: { users } };
}

export function setUserActionCreator(user) {
  return { type: ActionType.SET_USER, payload: { user } };
}

export function setProfileActionCreator(profile) {
  return { type: ActionType.SET_PROFILE, payload: { profile } };
}

export function setIsProfileActionCreator(status) {
  return { type: ActionType.SET_IS_PROFILE, payload: { status } };
}

export function setIsChangeProfileActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE, payload: { status } };
}

export function setIsChangeProfilePhotoActionCreator(status) {
  return { type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status } };
}

export function setIsChangeProfilePasswordActionCreator(status) {
  return {
    type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
    payload: { status },
  };
}

export function asyncSetUsers() {
  return async (dispatch) => {
    try {
      const { data } = await userApi.getUsers();
      dispatch(setUsersActionCreator(data.users)); // CEK DOKUMENTASI: data.users
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetUser(id) {
  return async (dispatch) => {
    try {
      const { data } = await userApi.getUserById(id);
      dispatch(setUserActionCreator(data.user)); // CEK DOKUMENTASI: data.user
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncSetProfile() {
  return async (dispatch) => {
    try {
      const { data } = await userApi.getProfile();
      dispatch(setProfileActionCreator(data.user)); // CEK DOKUMENTASI: data.user
    } catch {
      apiHelper.removeAccessToken();
      dispatch(setProfileActionCreator(null));
      dispatch(asyncSetIsAuthLogout());
    }
    dispatch(setIsProfileActionCreator(true));
  };
}

export function asyncSetIsChangeProfile(name, email) {
  return async (dispatch) => {
    try {
      const { message } = await userApi.putProfile(name, email);
      await showSuccessDialog(message);
      dispatch(setIsChangeProfileActionCreator(true));
      await dispatch(asyncSetProfile());
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfileActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsChangeProfilePhoto(file) {
  return async (dispatch) => {
    try {
      const { message } = await userApi.postProfilePhoto(file);
      await showSuccessDialog(message);
      dispatch(setIsChangeProfilePhotoActionCreator(true));
      await dispatch(asyncSetProfile());
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfilePhotoActionCreator(false));
      return false;
    }
  };
}

export function asyncSetIsChangeProfilePassword(password, newPassword) {
  return async (dispatch) => {
    try {
      const { message } = await userApi.putProfilePassword(
        password,
        newPassword
      );
      await showSuccessDialog(message);
      dispatch(setIsChangeProfilePasswordActionCreator(true));
      return true;
    } catch (error) {
      showErrorDialog(error.message);
      dispatch(setIsChangeProfilePasswordActionCreator(false));
      return false;
    }
  };
}