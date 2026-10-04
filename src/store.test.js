import { describe, expect, it } from "vitest";
import store, { reducers } from "./store";
import { setLostFoundsActionCreator } from "./features/lost-founds/states/action";
import { setUsersActionCreator } from "./features/users/states/action";
import { setIsAuthLoginActionCreator } from "./features/auth/states/action";

describe("store", () => {
  it("memuat semua bagian state yang didaftarkan", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(
      Object.keys(reducers).sort()
    );
  });

  it("memiliki nilai awal yang benar", () => {
    const state = store.getState();

    expect(state.isAuthLogin).toBe(false);
    expect(state.isAuthRegister).toBe(false);
    expect(state.isAuthLogout).toBe(false);
    expect(state.users).toEqual([]);
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isProfile).toBe(false);
    expect(state.lostFounds).toEqual([]);
    expect(state.lostFound).toBeNull();
    expect(state.lostFoundStats).toBeNull();
  });

  it("memperbarui state dari fitur yang berbeda lewat dispatch", () => {
    store.dispatch(setIsAuthLoginActionCreator(true));
    store.dispatch(setUsersActionCreator([{ id: 1, name: "Budi" }]));
    store.dispatch(setLostFoundsActionCreator([{ id: 7 }]));

    const state = store.getState();
    expect(state.isAuthLogin).toBe(true);
    expect(state.users).toEqual([{ id: 1, name: "Budi" }]);
    expect(state.lostFounds).toEqual([{ id: 7 }]);
  });

  it("mendukung thunk (fungsi async) lewat dispatch", async () => {
    const result = await store.dispatch(async (dispatch) => {
      dispatch(setLostFoundsActionCreator([{ id: 9 }]));
      return "selesai";
    });

    expect(result).toBe("selesai");
    expect(store.getState().lostFounds).toEqual([{ id: 9 }]);
  });
});