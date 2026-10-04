import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import userApi from "../api/userApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage";

vi.mock("../api/userApi", () => ({
  default: {
    getProfile: vi.fn(),
    putProfile: vi.fn(),
    postProfilePhoto: vi.fn(),
    putProfilePassword: vi.fn(),
  },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const baseProfile = { id: 1, name: "Budi", email: "budi@x.com", photo: null };

function renderProfile(profile = baseProfile) {
  return renderWithProviders(<ProfilePage />, {
    preloadedState: { profile },
  });
}

beforeEach(() => {
  userApi.getProfile.mockResolvedValue({ data: { user: baseProfile } });
});

describe("ProfilePage - tampilan", () => {
  it("mengisi form dengan data profil saat ini", () => {
    renderProfile();

    expect(screen.getByLabelText("Nama")).toHaveValue("Budi");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@x.com");
  });

  it("menampilkan inisial jika tidak ada foto", () => {
    renderProfile();

    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByAltText("Budi")).not.toBeInTheDocument();
  });

  it("menampilkan foto jika ada", () => {
    renderProfile({ ...baseProfile, photo: "img/profile/1.png" });

    const photo = screen.getByAltText("Budi");
    expect(photo.getAttribute("src")).toContain("/img/profile/1.png");
  });
});

describe("ProfilePage - ubah profil", () => {
  it("menampilkan pesan error jika nama dan email dikosongkan", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.clear(screen.getByLabelText("Nama"));
    await user.clear(screen.getByLabelText("Email"));
    await user.click(screen.getByRole("button", { name: "Simpan Profil" }));

    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(userApi.putProfile).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika format email tidak valid", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "salah");
    await user.click(screen.getByRole("button", { name: "Simpan Profil" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.queryByText("Nama wajib diisi")).not.toBeInTheDocument();
    expect(userApi.putProfile).not.toHaveBeenCalled();
  });

  it("menyimpan profil dan memperbarui state jika berhasil", async () => {
    const user = userEvent.setup();
    userApi.putProfile.mockResolvedValue({ message: "Berhasil mengubah data" });
    userApi.getProfile.mockResolvedValue({
      data: { user: { ...baseProfile, name: "Budi Baru" } },
    });
    const { store } = renderProfile();

    await user.clear(screen.getByLabelText("Nama"));
    await user.type(screen.getByLabelText("Nama"), "Budi Baru");
    await user.click(screen.getByRole("button", { name: "Simpan Profil" }));

    await waitFor(() =>
      expect(userApi.putProfile).toHaveBeenCalledWith(
        "Budi Baru",
        "budi@x.com"
      )
    );
    await waitFor(() =>
      expect(store.getState().profile.name).toBe("Budi Baru")
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
  });

  it("menampilkan dialog error jika gagal menyimpan", async () => {
    const user = userEvent.setup();
    userApi.putProfile.mockRejectedValue(new Error("Email sudah dipakai"));
    renderProfile();

    await user.click(screen.getByRole("button", { name: "Simpan Profil" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai")
    );
  });
});

describe("ProfilePage - foto profil", () => {
  it("meminta memilih foto dulu, lalu mengunggah setelah dipilih", async () => {
    const user = userEvent.setup();
    userApi.postProfilePhoto.mockResolvedValue({ message: "Foto diubah" });
    renderProfile();

    const input = screen.getByLabelText("Pilih foto");
    fireEvent.change(input, { target: { files: [] } });
    await user.click(screen.getByRole("button", { name: "Unggah Foto" }));

    expect(
      screen.getByText("Pilih foto terlebih dahulu")
    ).toBeInTheDocument();
    expect(userApi.postProfilePhoto).not.toHaveBeenCalled();

    const file = new File(["x"], "foto.png", { type: "image/png" });
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Unggah Foto" }));

    await waitFor(() => expect(userApi.postProfilePhoto).toHaveBeenCalled());
    expect(userApi.postProfilePhoto.mock.calls[0][0].name).toBe("foto.png");
    expect(
      screen.queryByText("Pilih foto terlebih dahulu")
    ).not.toBeInTheDocument();
  });
});

describe("ProfilePage - ganti kata sandi", () => {
  it("menampilkan pesan error jika kedua kolom kosong", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(screen.getByRole("button", { name: "Ganti Kata Sandi" }));

    expect(screen.getByText("Kata sandi lama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi baru wajib diisi")).toBeInTheDocument();
    expect(userApi.putProfilePassword).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika kata sandi baru terlalu pendek", async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.type(screen.getByLabelText("Kata Sandi Lama"), "lama123");
    await user.type(screen.getByLabelText("Kata Sandi Baru"), "123");
    await user.click(screen.getByRole("button", { name: "Ganti Kata Sandi" }));

    expect(
      screen.getByText("Kata sandi baru minimal 6 karakter")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Kata sandi lama wajib diisi")
    ).not.toBeInTheDocument();
    expect(userApi.putProfilePassword).not.toHaveBeenCalled();
  });

  it("mengosongkan kolom jika berhasil", async () => {
    const user = userEvent.setup();
    userApi.putProfilePassword.mockResolvedValue({ message: "Sandi diubah" });
    renderProfile();

    await user.type(screen.getByLabelText("Kata Sandi Lama"), "lama123");
    await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru123");
    await user.click(screen.getByRole("button", { name: "Ganti Kata Sandi" }));

    await waitFor(() =>
      expect(userApi.putProfilePassword).toHaveBeenCalledWith(
        "lama123",
        "baru123"
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Kata Sandi Lama")).toHaveValue("")
    );
    expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("");
  });

  it("mempertahankan isi kolom dan menampilkan dialog error jika gagal", async () => {
    const user = userEvent.setup();
    userApi.putProfilePassword.mockRejectedValue(new Error("Sandi lama salah"));
    renderProfile();

    await user.type(screen.getByLabelText("Kata Sandi Lama"), "salah");
    await user.type(screen.getByLabelText("Kata Sandi Baru"), "baru123");
    await user.click(screen.getByRole("button", { name: "Ganti Kata Sandi" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah")
    );
    expect(screen.getByLabelText("Kata Sandi Lama")).toHaveValue("salah");
    expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("baru123");
  });
});