import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import authApi from "../api/authApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

function renderRegister() {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<div>Halaman Login</div>} />
    </Routes>,
    { route: "/auth/register" }
  );
}

describe("RegisterPage", () => {
  it("menampilkan form register", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument();
  });

  it("menampilkan pesan error jika form kosong", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika email tidak valid dan kata sandi terlalu pendek", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText("Nama"), "Budi");
    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata Sandi"), "123");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(
      screen.getByText("Kata sandi minimal 6 karakter")
    ).toBeInTheDocument();
    expect(screen.queryByText("Nama wajib diisi")).not.toBeInTheDocument();
    expect(authApi.postRegister).not.toHaveBeenCalled();
  });

  it("pindah ke halaman login jika register berhasil", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockResolvedValue({
      message: "Berhasil melakukan pendaftaran",
    });
    renderRegister();

    await user.type(screen.getByLabelText("Nama"), "Budi");
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(authApi.postRegister).toHaveBeenCalledWith(
      "Budi",
      "a@b.com",
      "123456"
    );
    expect(showSuccessDialog).toHaveBeenCalledWith(
      "Berhasil melakukan pendaftaran"
    );
  });

  it("tetap di halaman register dan menampilkan dialog error jika gagal", async () => {
    const user = userEvent.setup();
    authApi.postRegister.mockRejectedValue(new Error("Email sudah dipakai"));
    renderRegister();

    await user.type(screen.getByLabelText("Nama"), "Budi");
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai")
    );
    expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled();
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
  });

  it("memiliki tautan ke halaman login", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("link", { name: "Masuk" }));

    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
  });
});