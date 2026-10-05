import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userApi from "./features/users/api/userApi";
import lostFoundApi from "./features/lost-founds/api/lostFoundApi";
import { renderWithProviders } from "./test-utils";
import App from "./App";

vi.mock("./features/users/api/userApi", () => ({
  default: { getProfile: vi.fn(), getUsers: vi.fn() },
}));

vi.mock("./features/lost-founds/api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFoundById: vi.fn(),
  },
}));

vi.mock("./helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { id: 1, name: "Budi", email: "budi@x.com", photo: null };

const lostFound = {
  id: 5,
  user_id: 1,
  title: "Dompet Hitam",
  description: "Hilang di kantin",
  status: "lost",
  is_completed: 0,
  cover: null,
  created_at: "2024-02-28T07:49:32.000000Z",
  author: { name: "Budi", photo: null },
};

function loginAs() {
  localStorage.setItem("accessToken", "token-abc");
  userApi.getProfile.mockResolvedValue({ data: { user: profile } });
  userApi.getUsers.mockResolvedValue({
    data: {
      users: [{ id: 1, name: "Budi", email: "budi@x.com", photo: null }],
    },
  });
  lostFoundApi.getLostFounds.mockResolvedValue({
    data: { lost_founds: [] },
  });
  lostFoundApi.getLostFoundById.mockResolvedValue({
    data: { lost_found: lostFound },
  });
}

describe("App - belum login", () => {
  it("mengalihkan /auth ke halaman login", () => {
    renderWithProviders(<App />, { route: "/auth" });

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menampilkan halaman login di /auth/login", () => {
    renderWithProviders(<App />, { route: "/auth/login" });

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menampilkan halaman register di /auth/register", () => {
    renderWithProviders(<App />, { route: "/auth/register" });

    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });

  it("mengalihkan halaman yang dilindungi ke login", () => {
    renderWithProviders(<App />, { route: "/" });

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("mengalihkan alamat yang tidak dikenal ke login", () => {
    renderWithProviders(<App />, { route: "/tidak-ada" });

    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });
});

describe("App - sudah login", () => {
  it("menampilkan dashboard di /", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/" });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();
  });

  it("menampilkan rincian laporan di /lost-founds/:id", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/lost-founds/5" });

    expect(
      await screen.findByRole("heading", { name: "Dompet Hitam" })
    ).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna di /users", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/users" });

    expect(
      await screen.findByRole("heading", { name: "Pengguna" })
    ).toBeInTheDocument();
    expect(await screen.findByText("budi@x.com")).toBeInTheDocument();
  });

  it("menampilkan profil di /profile", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/profile" });

    expect(
      await screen.findByRole("heading", { name: "Profil Saya" })
    ).toBeInTheDocument();
  });

  it("mengalihkan alamat yang tidak dikenal ke dashboard", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/tidak-ada" });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();
  });

  it("mengalihkan halaman login ke dashboard jika sudah punya token", async () => {
    loginAs();

    renderWithProviders(<App />, { route: "/auth/login" });

    expect(
      await screen.findByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Masuk" })
    ).not.toBeInTheDocument();
  });
});