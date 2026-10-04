import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from "./reducer";

const status = { status: true };

const cases = [
  ["usersReducer", usersReducer, ActionType.SET_USERS, [], { users: [{ id: 1 }] }, [{ id: 1 }]],
  ["userReducer", userReducer, ActionType.SET_USER, null, { user: { id: 1 } }, { id: 1 }],
  ["profileReducer", profileReducer, ActionType.SET_PROFILE, null, { profile: { id: 1 } }, { id: 1 }],
  ["isProfileReducer", isProfileReducer, ActionType.SET_IS_PROFILE, false, status, true],
  ["isChangeProfileReducer", isChangeProfileReducer, ActionType.SET_IS_CHANGE_PROFILE, false, status, true],
  ["isChangeProfilePhotoReducer", isChangeProfilePhotoReducer, ActionType.SET_IS_CHANGE_PROFILE_PHOTO, false, status, true],
  ["isChangeProfilePasswordReducer", isChangeProfilePasswordReducer, ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, false, status, true],
];

describe.each(cases)("%s", (_name, reducer, type, initial, payload, expected) => {
  it("memiliki nilai awal yang benar", () => {
    expect(reducer()).toEqual(initial);
  });

  it("mengubah nilai sesuai payload", () => {
    expect(reducer(initial, { type, payload })).toEqual(expected);
  });

  it("mengabaikan aksi yang tidak dikenal", () => {
    expect(reducer(expected, { type: "AKSI_LAIN" })).toBe(expected);
  });
});