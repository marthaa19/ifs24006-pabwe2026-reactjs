import { describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import userApi from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

describe("userApi", () => {
  it("getUsers memanggil GET /users", async () => {
    apiHelper.get.mockResolvedValue({ status: "success" });

    const result = await userApi.getUsers();

    expect(apiHelper.get).toHaveBeenCalledWith("/users");
    expect(result).toEqual({ status: "success" });
  });

  it("getUserById memanggil GET /users/:id", async () => {
    apiHelper.get.mockResolvedValue({ status: "success" });

    await userApi.getUserById(7);

    expect(apiHelper.get).toHaveBeenCalledWith("/users/7");
  });

  it("getProfile memanggil GET /users/me", async () => {
    apiHelper.get.mockResolvedValue({ status: "success" });

    await userApi.getProfile();

    expect(apiHelper.get).toHaveBeenCalledWith("/users/me");
  });

  it("putProfile memanggil PUT /users/me dengan nama dan email", async () => {
    apiHelper.put.mockResolvedValue({ status: "success" });

    await userApi.putProfile("Budi", "budi@x.com");

    expect(apiHelper.put).toHaveBeenCalledWith("/users/me", {
      name: "Budi",
      email: "budi@x.com",
    });
  });

  it("postProfilePhoto mengirim FormData berisi field photo", async () => {
    apiHelper.post.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await userApi.postProfilePhoto(file);

    const [path, body] = apiHelper.post.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("photo").name).toBe("foto.png");
  });

  it("putProfilePassword mengirim kata sandi lama, baru, dan konfirmasinya", async () => {
    apiHelper.put.mockResolvedValue({ status: "success" });

    await userApi.putProfilePassword("lama123", "baru123");

    expect(apiHelper.put).toHaveBeenCalledWith("/users/password", {
      password: "lama123",
      new_password: "baru123",
      new_password_confirmation: "baru123",
    });
  });
});