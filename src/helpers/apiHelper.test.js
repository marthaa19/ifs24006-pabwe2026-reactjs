import { afterEach, describe, expect, it, vi } from "vitest";
import apiHelper from "./apiHelper";

function mockFetch(responseJson) {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(responseJson),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const successResponse = { status: "success", message: "OK", data: { x: 1 } };

describe("apiHelper", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("penyimpanan token", () => {
    it("menyimpan, mengambil, dan menghapus token", () => {
      expect(apiHelper.getAccessToken()).toBeNull();

      apiHelper.putAccessToken("token-123");
      expect(apiHelper.getAccessToken()).toBe("token-123");

      apiHelper.removeAccessToken();
      expect(apiHelper.getAccessToken()).toBeNull();
    });
  });

  describe("request", () => {
    it("memakai GET tanpa opsi apa pun", async () => {
      const fetchMock = mockFetch(successResponse);

      const result = await apiHelper.request("/ping");

      expect(result).toEqual(successResponse);
      expect(fetchMock).toHaveBeenCalledWith(`${DELCOM_BASEURL}/ping`, {
        method: "GET",
        headers: { Accept: "application/json" },
        body: undefined,
      });
    });

    it("menyertakan token di header Authorization jika ada", async () => {
      const fetchMock = mockFetch(successResponse);
      apiHelper.putAccessToken("token-abc");

      await apiHelper.get("/users");

      const options = fetchMock.mock.calls[0][1];
      expect(options.headers.Authorization).toBe("Bearer token-abc");
    });

    it("tidak menyertakan Authorization jika token tidak ada", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.get("/users");

      const options = fetchMock.mock.calls[0][1];
      expect(options.headers.Authorization).toBeUndefined();
    });

    it("melempar error berisi pesan server jika status bukan success", async () => {
      mockFetch({ status: "fail", message: "Kredensial salah" });

      await expect(apiHelper.get("/users")).rejects.toThrow("Kredensial salah");
    });
  });

  describe("get", () => {
    it("menyusun query dan melewati nilai kosong", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.get("/lost-founds", {
        status: "lost",
        is_completed: 0,
        kosong: "",
        nol: null,
        takAda: undefined,
      });

      expect(fetchMock.mock.calls[0][0]).toBe(
        `${DELCOM_BASEURL}/lost-founds?status=lost&is_completed=0`
      );
      expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    });

    it("tidak menambah query jika params tidak diberikan", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.get("/users");

      expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/users`);
    });
  });

  describe("post, put, dan delete", () => {
    it("post mengirim body sebagai JSON", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.post("/auth/login", { email: "a@b.c", password: "123456" });

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${DELCOM_BASEURL}/auth/login`);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.body).toBe(
        JSON.stringify({ email: "a@b.c", password: "123456" })
      );
    });

    it("post mengirim FormData apa adanya tanpa Content-Type", async () => {
      const fetchMock = mockFetch(successResponse);
      const formData = new FormData();
      formData.append("cover", new File(["x"], "cover.png"));

      await apiHelper.post("/lost-founds/1/cover", formData);

      const options = fetchMock.mock.calls[0][1];
      expect(options.body).toBe(formData);
      expect(options.headers["Content-Type"]).toBeUndefined();
    });

    it("put mengirim body sebagai JSON", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.put("/users/me", { name: "Budi" });

      const options = fetchMock.mock.calls[0][1];
      expect(options.method).toBe("PUT");
      expect(options.body).toBe(JSON.stringify({ name: "Budi" }));
    });

    it("delete memakai method DELETE tanpa body", async () => {
      const fetchMock = mockFetch(successResponse);

      await apiHelper.delete("/lost-founds/1");

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${DELCOM_BASEURL}/lost-founds/1`);
      expect(options.method).toBe("DELETE");
      expect(options.body).toBeUndefined();
    });
  });
});