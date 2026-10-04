import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout";

function renderLayout(options) {
  return renderWithProviders(
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<div>Halaman Login</div>} />
      </Route>
      <Route path="/" element={<div>Beranda</div>} />
    </Routes>,
    { route: "/auth/login", ...options }
  );
}

describe("AuthLayout", () => {
  it("menampilkan banner dan halaman anak jika belum login", () => {
    renderLayout();

    expect(screen.getByText("Lost & Founds")).toBeInTheDocument();
    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
    expect(screen.queryByText("Beranda")).not.toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika token sudah ada", () => {
    apiHelper.putAccessToken("token-abc");

    renderLayout();

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.queryByText("Halaman Login")).not.toBeInTheDocument();
  });

  it("mengalihkan ke beranda jika state isAuthLogin bernilai true", () => {
    renderLayout({ preloadedState: { isAuthLogin: true } });

    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });
});