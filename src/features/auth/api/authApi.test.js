import { describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import authApi from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: { post: vi.fn() },
}));

describe("authApi", () => {
  it("postLogin memanggil POST /auth/login dengan email dan password", async () => {
    apiHelper.post.mockResolvedValue({ status: "success" });

    const result = await authApi.postLogin("a@b.com", "123456");

    expect(apiHelper.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "123456",
    });
    expect(result).toEqual({ status: "success" });
  });

  it("postRegister memanggil POST /auth/register dengan nama, email, dan password", async () => {
    apiHelper.post.mockResolvedValue({ status: "success" });

    const result = await authApi.postRegister("Budi", "a@b.com", "123456");

    expect(apiHelper.post).toHaveBeenCalledWith("/auth/register", {
      name: "Budi",
      email: "a@b.com",
      password: "123456",
    });
    expect(result).toEqual({ status: "success" });
  });
});