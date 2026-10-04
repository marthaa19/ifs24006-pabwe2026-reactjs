import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import userApi from "../../users/api/userApi";
import { renderWithProviders } from "../../../test-utils";
import LostFoundLayout from "./LostFoundLayout";

vi.mock("../../users/api/userApi", () => ({
  default: { getProfile: vi.fn() },
}));

const profile = { id: 1, name: "Budi", email: "budi@x.com", photo: null };

function renderLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<LostFoundLayout />}>
        <Route path="/" element={<div>Isi Halaman</div>} />
      </Route>
      <Route path="/auth/login" element={<div>Halaman Login</div>} />
    </Routes>
  );
}

describe("LostFoundLayout", () => {
  it("mengalihkan ke halaman login jika tidak ada token", () => {
    renderLayout();

    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

    it("mengalihkan ke login jika server membalas tanpa data profil", async () => {
    localStorage.setItem("accessToken", "token-abc");
    userApi.getProfile.mockResolvedValue({ data: { user: null } });

    renderLayout();

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(screen.queryByText("Isi Halaman")).not.toBeInTheDocument();
  });

  it("menampilkan 'Memuat...' lalu kerangka halaman setelah profil dimuat", async () => {
    localStorage.setItem("accessToken", "token-abc");
    userApi.getProfile.mockResolvedValue({ data: { user: profile } });

    renderLayout();

    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(await screen.findByText("Isi Halaman")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
  });

  it("mengeluarkan pengguna jika profil gagal dimuat", async () => {
    localStorage.setItem("accessToken", "token-kedaluwarsa");
    userApi.getProfile.mockRejectedValue(new Error("Unauthenticated"));

    renderLayout();

    expect(await screen.findByText("Halaman Login")).toBeInTheDocument();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(screen.queryByText("Isi Halaman")).not.toBeInTheDocument();
  });

  it("membuka dan menutup sidebar lewat tombol menu dan lapisan gelap", async () => {
    const user = userEvent.setup();
    localStorage.setItem("accessToken", "token-abc");
    userApi.getProfile.mockResolvedValue({ data: { user: profile } });
    renderLayout();
    await screen.findByText("Isi Halaman");

    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();

    await user.click(screen.getByTestId("sidebar-overlay"));
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });
});