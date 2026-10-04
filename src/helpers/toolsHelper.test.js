import { describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toImageUrl,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

describe("toolsHelper", () => {
  describe("showSuccessDialog", () => {
    it("menampilkan dialog sukses dengan pesan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      await showSuccessDialog("Berhasil menyimpan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "success", text: "Berhasil menyimpan" })
      );
    });
  });

  describe("showErrorDialog", () => {
    it("menampilkan dialog error dengan pesan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      await showErrorDialog("Terjadi kesalahan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", text: "Terjadi kesalahan" })
      );
    });
  });

  describe("showConfirmDialog", () => {
    it("mengembalikan true jika pengguna menekan konfirmasi", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      const result = await showConfirmDialog("Yakin?");

      expect(result).toBe(true);
    });

    it("mengembalikan false jika pengguna membatalkan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });

      const result = await showConfirmDialog("Yakin?");

      expect(result).toBe(false);
    });

    it("memakai teks tombol bawaan 'Ya' atau teks yang diberikan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      await showConfirmDialog("Yakin?");
      expect(Swal.fire).toHaveBeenLastCalledWith(
        expect.objectContaining({ confirmButtonText: "Ya" })
      );

      await showConfirmDialog("Hapus data?", "Hapus");
      expect(Swal.fire).toHaveBeenLastCalledWith(
        expect.objectContaining({ confirmButtonText: "Hapus" })
      );
    });
  });

  describe("formatDate", () => {
    it("mengembalikan tanda strip jika tanggal kosong", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate("")).toBe("-");
    });

    it("memformat tanggal ke format Indonesia", () => {
      const input = "2024-02-28T12:00:00.000Z";
      const expected = new Date(input).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(formatDate(input)).toBe(expected);
      expect(formatDate(input)).toContain("2024");
    });
  });

  describe("toImageUrl", () => {
    const host = DELCOM_BASEURL.replace(/\/api\/v1\/?$/, "");

    it("mengembalikan null jika path kosong", () => {
      expect(toImageUrl(null)).toBeNull();
      expect(toImageUrl("")).toBeNull();
    });

    it("mengembalikan URL lengkap apa adanya", () => {
      expect(toImageUrl("https://contoh.com/a.png")).toBe(
        "https://contoh.com/a.png"
      );
      expect(toImageUrl("http://contoh.com/a.png")).toBe(
        "http://contoh.com/a.png"
      );
    });

    it("menggabungkan path relatif dengan alamat server tanpa /api/v1", () => {
      expect(host).not.toContain("/api/v1");
      expect(toImageUrl("img/lost-founds/cover/1.png")).toBe(
        `${host}/img/lost-founds/cover/1.png`
      );
    });

    it("membuang garis miring di awal path", () => {
      expect(toImageUrl("/img/profile/1.png")).toBe(`${host}/img/profile/1.png`);
    });
  });
});