import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage";

vi.mock("../api/authApi", () => ({
  default: { postLogin: vi.fn(), postRegister: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<div>Halaman Register</div>} />
      <Route path="/" element={<div>Beranda</div>} />
    </Routes>,
    { route: "/auth/login" }
  );
}

describe("LoginPage", () => {
  it("menampilkan form login", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menampilkan pesan error jika form kosong", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika format email tidak valid", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(
      screen.queryByText("Kata sandi wajib diisi")
    ).not.toBeInTheDocument();
    expect(authApi.postLogin).not.toHaveBeenCalled();
  });

  it("pindah ke beranda dan menyimpan token jika login berhasil", async () => {
    const user = userEvent.setup();
    authApi.postLogin.mockResolvedValue({ data: { token: "token-xyz" } });
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(authApi.postLogin).toHaveBeenCalledWith("a@b.com", "123456");
    expect(localStorage.getItem("accessToken")).toBe("token-xyz");
  });

  it("menampilkan status memproses selama login berjalan", async () => {
    const user = userEvent.setup();
    let resolveLogin;
    authApi.postLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    const loadingButton = await screen.findByRole("button", {
      name: "Memproses...",
    });
    expect(loadingButton).toBeDisabled();

    resolveLogin({ data: { token: "t" } });
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
  });

  it("tetap di halaman login dan menampilkan dialog error jika login gagal", async () => {
    const user = userEvent.setup();
    authApi.postLogin.mockRejectedValue(new Error("Kredensial salah"));
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Kata Sandi"), "salah");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("button", { name: "Masuk" })).toBeEnabled();
    expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
    expect(screen.queryByText("Beranda")).not.toBeInTheDocument();
  });

  it("memiliki tautan ke halaman register", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("link", { name: "Daftar" }));

    expect(screen.getByText("Halaman Register")).toBeInTheDocument();
  });
});