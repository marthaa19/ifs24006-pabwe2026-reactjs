import { describe, expect, it, vi } from "vitest";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsAuthLogin,
  asyncSetIsAuthLogout,
  asyncSetIsAuthRegister,
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from "./action";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));

vi.mock("../../../helpers/apiHelper", () => ({
  default: { putAccessToken: vi.fn(), removeAccessToken: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("action creator auth", () => {
  it("setIsAuthLoginActionCreator membentuk aksi yang benar", () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGIN,
      payload: { status: true },
    });
  });

  it("setIsAuthRegisterActionCreator membentuk aksi yang benar", () => {
    expect(setIsAuthRegisterActionCreator(false)).toEqual({
      type: ActionType.SET_IS_AUTH_REGISTER,
      payload: { status: false },
    });
  });

  it("setIsAuthLogoutActionCreator membentuk aksi yang benar", () => {
    expect(setIsAuthLogoutActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGOUT,
      payload: { status: true },
    });
  });
});

describe("asyncSetIsAuthLogin", () => {
  it("menyimpan token dan mengubah state jika login berhasil", async () => {
    const dispatch = vi.fn();
    authApi.postLogin.mockResolvedValue({ data: { token: "token-123" } });

    const result = await asyncSetIsAuthLogin("a@b.com", "123456")(dispatch);

    expect(authApi.postLogin).toHaveBeenCalledWith("a@b.com", "123456");
    expect(apiHelper.putAccessToken).toHaveBeenCalledWith("token-123");
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(false));
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika login gagal", async () => {
    const dispatch = vi.fn();
    authApi.postLogin.mockRejectedValue(new Error("Kredensial salah"));

    const result = await asyncSetIsAuthLogin("a@b.com", "salah")(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
    expect(apiHelper.putAccessToken).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    expect(result).toBe(false);
  });
});

describe("asyncSetIsAuthRegister", () => {
  it("menampilkan dialog sukses jika register berhasil", async () => {
    const dispatch = vi.fn();
    authApi.postRegister.mockResolvedValue({ message: "Berhasil mendaftar" });

    const result = await asyncSetIsAuthRegister(
      "Budi",
      "a@b.com",
      "123456"
    )(dispatch);

    expect(authApi.postRegister).toHaveBeenCalledWith(
      "Budi",
      "a@b.com",
      "123456"
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika register gagal", async () => {
    const dispatch = vi.fn();
    authApi.postRegister.mockRejectedValue(new Error("Email sudah dipakai"));

    const result = await asyncSetIsAuthRegister(
      "Budi",
      "a@b.com",
      "123456"
    )(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(dispatch).toHaveBeenCalledWith(
      setIsAuthRegisterActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsAuthLogout", () => {
  it("menghapus token dan mengubah state", () => {
    const dispatch = vi.fn();

    asyncSetIsAuthLogout()(dispatch);

    expect(apiHelper.removeAccessToken).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
  });
});