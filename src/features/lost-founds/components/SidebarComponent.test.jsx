import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent";

function renderSidebar({ isOpen = false, onClose = vi.fn(), route = "/" } = {}) {
  return renderWithProviders(
    <Routes>
      <Route
        path="*"
        element={<SidebarComponent isOpen={isOpen} onClose={onClose} />}
      />
    </Routes>,
    { route }
  );
}

describe("SidebarComponent", () => {
  it("menampilkan tiga menu dengan alamat yang benar", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveAttribute(
      "href",
      "/users"
    );
    expect(screen.getByRole("link", { name: "Profil Saya" })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("menandai menu yang sedang aktif", () => {
    renderSidebar({ route: "/users" });

    expect(screen.getByRole("link", { name: "Pengguna" })).toHaveClass(
      "text-indigo-600"
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "text-indigo-600"
    );
  });

  it("tidak menampilkan lapisan gelap saat tertutup", () => {
    renderSidebar({ isOpen: false });

    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("menampilkan lapisan gelap saat terbuka dan menutup saat diketuk", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSidebar({ isOpen: true, onClose });

    await user.click(screen.getByTestId("sidebar-overlay"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat tombol tutup ditekan", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSidebar({ isOpen: true, onClose });

    await user.click(screen.getByRole("button", { name: "Tutup menu" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat salah satu menu dipilih", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSidebar({ isOpen: true, onClose });

    await user.click(screen.getByRole("link", { name: "Profil Saya" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});