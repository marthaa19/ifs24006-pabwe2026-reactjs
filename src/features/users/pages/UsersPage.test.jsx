import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userApi from "../api/userApi";
import { renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage";

vi.mock("../api/userApi", () => ({
  default: { getUsers: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
}));

describe("UsersPage", () => {
  it("menampilkan daftar pengguna dari API", async () => {
    userApi.getUsers.mockResolvedValue({
      data: {
        users: [
          { id: 1, name: "Budi", email: "budi@x.com", photo: "img/profile/1.png" },
          { id: 2, name: "ani", email: "ani@x.com", photo: null },
        ],
      },
    });

    renderWithProviders(<UsersPage />);

    expect(
      screen.getByRole("heading", { name: "Pengguna" })
    ).toBeInTheDocument();
    expect(await screen.findByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("budi@x.com")).toBeInTheDocument();
    expect(screen.getByText("ani")).toBeInTheDocument();
    expect(screen.getByText("ani@x.com")).toBeInTheDocument();
  });

  it("menampilkan foto jika ada dan inisial jika tidak ada", async () => {
    userApi.getUsers.mockResolvedValue({
      data: {
        users: [
          { id: 1, name: "Budi", email: "budi@x.com", photo: "img/profile/1.png" },
          { id: 2, name: "ani", email: "ani@x.com", photo: null },
        ],
      },
    });

    renderWithProviders(<UsersPage />);

    const photo = await screen.findByAltText("Budi");
    expect(photo.getAttribute("src")).toContain("/img/profile/1.png");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByAltText("ani")).not.toBeInTheDocument();
  });

  it("tidak menampilkan kartu jika daftar kosong", async () => {
    userApi.getUsers.mockResolvedValue({ data: { users: [] } });

    renderWithProviders(<UsersPage />);

    await vi.waitFor(() => expect(userApi.getUsers).toHaveBeenCalled());
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});