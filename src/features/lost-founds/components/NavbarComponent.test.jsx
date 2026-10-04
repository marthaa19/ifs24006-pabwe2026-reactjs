import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import NavbarComponent from "./NavbarComponent";

const baseProfile = { id: 1, name: "Budi", email: "budi@x.com", photo: null };

function renderNavbar(profile = baseProfile, onToggleSidebar = vi.fn()) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={<NavbarComponent onToggleSidebar={onToggleSidebar} />}
      />
      <Route path="/auth/login" element={<div>Halaman Login</div>} />
    </Routes>,
    { preloadedState: { profile } }
  );
}

describe("NavbarComponent", () => {
  it("menampilkan nama aplikasi dan nama pengguna", () => {
    renderNavbar();

    expect(screen.getByText("Lost & Founds")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("menampilkan inisial jika pengguna tidak punya foto", () => {
    renderNavbar();

    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByAltText("Budi")).not.toBeInTheDocument();
  });

  it("menampilkan foto jika pengguna punya foto", () => {
    renderNavbar({ ...baseProfile, photo: "img/profile/1.png" });

    const photo = screen.getByAltText("Budi");
    expect(photo.getAttribute("src")).toContain("/img/profile/1.png");
  });

  it("memanggil onToggleSidebar saat tombol menu ditekan", async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();
    renderNavbar(baseProfile, onToggleSidebar);

    await user.click(screen.getByRole("button", { name: "Buka menu" }));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("menghapus token dan pindah ke halaman login saat keluar", async () => {
    const user = userEvent.setup();
    localStorage.setItem("accessToken", "token-abc");
    const { store } = renderNavbar();

    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(store.getState().isAuthLogout).toBe(true);
  });
});