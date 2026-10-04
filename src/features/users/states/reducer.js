import { ActionType } from "./action";

export function usersReducer(users = [], action = {}) {
  switch (action.type) {
    case ActionType.SET_USERS:
      return action.payload.users;
    default:
      return users;
  }
}

export function userReducer(user = null, action = {}) {
  switch (action.type) {
    case ActionType.SET_USER:
      return action.payload.user;
    default:
      return user;
  }
}

export function profileReducer(profile = null, action = {}) {
  switch (action.type) {
    case ActionType.SET_PROFILE:
      return action.payload.profile;
    default:
      return profile;
  }
}

export function isProfileReducer(isProfile = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_PROFILE:
      return action.payload.status;
    default:
      return isProfile;
  }
}

export function isChangeProfileReducer(isChangeProfile = false, action = {}) {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE:
      return action.payload.status;
    default:
      return isChangeProfile;
  }
}

export function isChangeProfilePhotoReducer(
  isChangeProfilePhoto = false,
  action = {}
) {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PHOTO:
      return action.payload.status;
    default:
      return isChangeProfilePhoto;
  }
}

export function isChangeProfilePasswordReducer(
  isChangeProfilePassword = false,
  action = {}
) {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PASSWORD:
      return action.payload.status;
    default:
      return isChangeProfilePassword;
  }
}