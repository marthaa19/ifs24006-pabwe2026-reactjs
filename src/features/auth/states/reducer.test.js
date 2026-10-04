import { describe, expect, it } from "vitest";
import { ActionType } from "./action";
import {
  isAuthLoginReducer,
  isAuthLogoutReducer,
  isAuthRegisterReducer,
} from "./reducer";

const cases = [
  ["isAuthLoginReducer", isAuthLoginReducer, ActionType.SET_IS_AUTH_LOGIN],
  [
    "isAuthRegisterReducer",
    isAuthRegisterReducer,
    ActionType.SET_IS_AUTH_REGISTER,
  ],
  ["isAuthLogoutReducer", isAuthLogoutReducer, ActionType.SET_IS_AUTH_LOGOUT],
];

describe.each(cases)("%s", (_name, reducer, type) => {
  it("bernilai false secara bawaan", () => {
    expect(reducer()).toBe(false);
  });

  it("mengubah nilai sesuai payload", () => {
    expect(reducer(false, { type, payload: { status: true } })).toBe(true);
  });

  it("mengabaikan aksi yang tidak dikenal", () => {
    expect(reducer(true, { type: "AKSI_LAIN" })).toBe(true);
  });
});