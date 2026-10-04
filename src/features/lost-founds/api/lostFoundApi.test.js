import { describe, expect, it, vi } from "vitest";
import apiHelper from "../../../helpers/apiHelper";
import lostFoundApi from "./lostFoundApi";

vi.mock("../../../helpers/apiHelper", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const ok = { status: "success" };

describe("lostFoundApi", () => {
  it("getLostFounds memanggil GET /lost-founds dengan filter", async () => {
    apiHelper.get.mockResolvedValue(ok);
    const params = { status: "lost", is_completed: 0 };

    const result = await lostFoundApi.getLostFounds(params);

    expect(apiHelper.get).toHaveBeenCalledWith("/lost-founds", params);
    expect(result).toEqual(ok);
  });

  it("getLostFoundById memanggil GET /lost-founds/:id", async () => {
    apiHelper.get.mockResolvedValue(ok);

    await lostFoundApi.getLostFoundById(5);

    expect(apiHelper.get).toHaveBeenCalledWith("/lost-founds/5");
  });

  it("postLostFound memanggil POST /lost-founds dengan judul, deskripsi, dan status", async () => {
    apiHelper.post.mockResolvedValue(ok);

    await lostFoundApi.postLostFound("Dompet", "Warna hitam", "lost");

    expect(apiHelper.post).toHaveBeenCalledWith("/lost-founds", {
      title: "Dompet",
      description: "Warna hitam",
      status: "lost",
    });
  });

  it("putLostFound mengirim is_completed bernilai 1 jika selesai", async () => {
    apiHelper.put.mockResolvedValue(ok);

    await lostFoundApi.putLostFound(5, "Dompet", "Warna hitam", "found", true);

    expect(apiHelper.put).toHaveBeenCalledWith("/lost-founds/5", {
      title: "Dompet",
      description: "Warna hitam",
      status: "found",
      is_completed: 1,
    });
  });

  it("putLostFound mengirim is_completed bernilai 0 jika belum selesai", async () => {
    apiHelper.put.mockResolvedValue(ok);

    await lostFoundApi.putLostFound(5, "Dompet", "Warna hitam", "lost", false);

    expect(apiHelper.put).toHaveBeenCalledWith(
      "/lost-founds/5",
      expect.objectContaining({ is_completed: 0 })
    );
  });

  it("postLostFoundCover mengirim FormData berisi field cover", async () => {
    apiHelper.post.mockResolvedValue(ok);
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await lostFoundApi.postLostFoundCover(5, file);

    const [path, body] = apiHelper.post.mock.calls[0];
    expect(path).toBe("/lost-founds/5/cover");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("cover").name).toBe("cover.png");
  });

  it("deleteLostFound memanggil DELETE /lost-founds/:id", async () => {
    apiHelper.delete.mockResolvedValue(ok);

    await lostFoundApi.deleteLostFound(5);

    expect(apiHelper.delete).toHaveBeenCalledWith("/lost-founds/5");
  });

  it("getStatsDaily memanggil GET statistik harian", async () => {
    apiHelper.get.mockResolvedValue(ok);
    const params = { total_data: 7 };

    await lostFoundApi.getStatsDaily(params);

    expect(apiHelper.get).toHaveBeenCalledWith(
      "/lost-founds/stats/daily",
      params
    );
  });

  it("getStatsMonthly memanggil GET statistik bulanan", async () => {
    apiHelper.get.mockResolvedValue(ok);
    const params = { total_data: 5 };

    await lostFoundApi.getStatsMonthly(params);

    expect(apiHelper.get).toHaveBeenCalledWith(
      "/lost-founds/stats/monthly",
      params
    );
  });
});