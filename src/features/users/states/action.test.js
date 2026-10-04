import { describe, expect, it, vi } from "vitest";
import userApi from "../api/userApi";
import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePassword,
  asyncSetIsChangeProfilePhoto,
  asyncSetProfile,
  asyncSetUser,
  asyncSetUsers,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePasswordActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsProfileActionCreator,
  setProfileActionCreator,
  setUserActionCreator,
  setUsersActionCreator,
} from "./action";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    getProfile: vi.fn(),
    putProfile: vi.fn(),
    postProfilePhoto: vi.fn(),
    putProfilePassword: vi.fn(),
  },
}));

vi.mock("../../../helpers/apiHelper", () => ({
  default: { removeAccessToken: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

vi.mock("../../auth/states/action", () => ({
  asyncSetIsAuthLogout: vi.fn(() => "thunk-logout"),
}));

describe("action creator users", () => {
  it("membentuk aksi yang benar", () => {
    expect(setUsersActionCreator([1])).toEqual({
      type: ActionType.SET_USERS,
      payload: { users: [1] },
    });
    expect(setUserActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_USER,
      payload: { user: { id: 1 } },
    });
    expect(setProfileActionCreator({ id: 2 })).toEqual({
      type: ActionType.SET_PROFILE,
      payload: { profile: { id: 2 } },
    });
    expect(setIsProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_PROFILE,
      payload: { status: true },
    });
    expect(setIsChangeProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE,
      payload: { status: true },
    });
    expect(setIsChangeProfilePhotoActionCreator(false)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
      payload: { status: false },
    });
    expect(setIsChangeProfilePasswordActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
      payload: { status: true },
    });
  });
});

describe("asyncSetUsers", () => {
  it("menyimpan daftar pengguna jika berhasil", async () => {
    const dispatch = vi.fn();
    userApi.getUsers.mockResolvedValue({ data: { users: [{ id: 1 }] } });

    await asyncSetUsers()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([{ id: 1 }]));
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.getUsers.mockRejectedValue(new Error("Gagal memuat"));

    await asyncSetUsers()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("asyncSetUser", () => {
  it("menyimpan satu pengguna jika berhasil", async () => {
    const dispatch = vi.fn();
    userApi.getUserById.mockResolvedValue({ data: { user: { id: 5 } } });

    await asyncSetUser(5)(dispatch);

    expect(userApi.getUserById).toHaveBeenCalledWith(5);
    expect(dispatch).toHaveBeenCalledWith(setUserActionCreator({ id: 5 }));
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.getUserById.mockRejectedValue(new Error("Tidak ditemukan"));

    await asyncSetUser(5)(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan");
  });
});

describe("asyncSetProfile", () => {
  it("menyimpan profil dan menandai selesai dimuat jika berhasil", async () => {
    const dispatch = vi.fn();
    userApi.getProfile.mockResolvedValue({ data: { user: { id: 1 } } });

    await asyncSetProfile()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator({ id: 1 }));
    expect(dispatch).toHaveBeenCalledWith(setIsProfileActionCreator(true));
    expect(apiHelper.removeAccessToken).not.toHaveBeenCalled();
  });

  it("menghapus token dan mengeluarkan pengguna jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.getProfile.mockRejectedValue(new Error("Token tidak valid"));

    await asyncSetProfile()(dispatch);

    expect(apiHelper.removeAccessToken).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(null));
    expect(dispatch).toHaveBeenCalledWith("thunk-logout");
    expect(dispatch).toHaveBeenCalledWith(setIsProfileActionCreator(true));
  });
});

describe("asyncSetIsChangeProfile", () => {
  it("menampilkan dialog sukses lalu memuat ulang profil jika berhasil", async () => {
    const dispatch = vi.fn();
    userApi.putProfile.mockResolvedValue({ message: "Berhasil mengubah data" });

    const result = await asyncSetIsChangeProfile("Budi", "b@x.com")(dispatch);

    expect(userApi.putProfile).toHaveBeenCalledWith("Budi", "b@x.com");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfileActionCreator(true)
    );
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.putProfile.mockRejectedValue(new Error("Email sudah dipakai"));

    const result = await asyncSetIsChangeProfile("Budi", "b@x.com")(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfileActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsChangeProfilePhoto", () => {
  it("menampilkan dialog sukses lalu memuat ulang profil jika berhasil", async () => {
    const dispatch = vi.fn();
    const file = new File(["x"], "foto.png");
    userApi.postProfilePhoto.mockResolvedValue({ message: "Foto diubah" });

    const result = await asyncSetIsChangeProfilePhoto(file)(dispatch);

    expect(userApi.postProfilePhoto).toHaveBeenCalledWith(file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Foto diubah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfilePhotoActionCreator(true)
    );
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.postProfilePhoto.mockRejectedValue(new Error("File terlalu besar"));

    const result = await asyncSetIsChangeProfilePhoto(new File(["x"], "a.png"))(
      dispatch
    );

    expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfilePhotoActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsChangeProfilePassword", () => {
  it("menampilkan dialog sukses jika berhasil", async () => {
    const dispatch = vi.fn();
    userApi.putProfilePassword.mockResolvedValue({ message: "Sandi diubah" });

    const result = await asyncSetIsChangeProfilePassword(
      "lama123",
      "baru123"
    )(dispatch);

    expect(userApi.putProfilePassword).toHaveBeenCalledWith(
      "lama123",
      "baru123"
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Sandi diubah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfilePasswordActionCreator(true)
    );
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    userApi.putProfilePassword.mockRejectedValue(new Error("Sandi lama salah"));

    const result = await asyncSetIsChangeProfilePassword(
      "salah",
      "baru123"
    )(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeProfilePasswordActionCreator(false)
    );
    expect(result).toBe(false);
  });
});