import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthLogoutReducer,
  isAuthRegisterReducer,
} from "./features/auth/states/reducer";
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from "./features/users/states/reducer";
import {
  isAddLostFoundReducer,
  isChangeCoverLostFoundReducer,
  isChangeLostFoundReducer,
  isDeleteLostFoundReducer,
  lostFoundReducer,
  lostFoundsReducer,
  lostFoundStatsReducer,
} from "./features/lost-founds/states/reducer";

export const reducers = {
  isAuthLogin: isAuthLoginReducer,
  isAuthRegister: isAuthRegisterReducer,
  isAuthLogout: isAuthLogoutReducer,
  users: usersReducer,
  user: userReducer,
  profile: profileReducer,
  isProfile: isProfileReducer,
  isChangeProfile: isChangeProfileReducer,
  isChangeProfilePhoto: isChangeProfilePhotoReducer,
  isChangeProfilePassword: isChangeProfilePasswordReducer,
  lostFounds: lostFoundsReducer,
  lostFound: lostFoundReducer,
  lostFoundStats: lostFoundStatsReducer,
  isAddLostFound: isAddLostFoundReducer,
  isChangeLostFound: isChangeLostFoundReducer,
  isChangeCoverLostFound: isChangeCoverLostFoundReducer,
  isDeleteLostFound: isDeleteLostFoundReducer,
};

const store = configureStore({ reducer: reducers });

export default store;