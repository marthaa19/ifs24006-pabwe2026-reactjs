import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import lostFoundApi from "../api/lostFoundApi";
import { renderWithProviders } from "../../../test-utils";
import HomePage from "./HomePage";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    postLostFound: vi.fn(),
  },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const items = [
  {
    id: 1,
    title: "Dompet Hitam",
    description: "Hilang di kantin",
    status: "lost",
    is_completed: 0,
    cover: "img/lost-founds/cover/1.png",
    created_at: "2024-02-28T07:49:32.000000Z",
    author: { name: "Budi", photo: null },
  },
  {
    id: 2,
    title: "Kunci Motor",
    description: "Ditemukan di parkiran",
    status: "found",
    is_completed: 1,
    cover: null,
    created_at: "2024-02-29T07:49:32.000000Z",
    author: { name: "Ani", photo: null },
  },
];

const moreItems = [
  ...items,
  {
    id: 3,
    title: "Payung Biru",
    description: "Tertinggal di perpustakaan",
    status: "lost",
    is_completed: 1,
    cover: null,
    created_at: "2024-03-01T07:49:32.000000Z",
    author: { name: "Citra", photo: null },
  },
];

function cardValue(label) {
  return screen.getByText(label, { selector: "p" }).nextElementSibling;
}

beforeEach(() => {
  lostFoundApi.getLostFounds.mockResolvedValue({
    data: { lost_founds: items },
  });
});

describe("HomePage - daftar laporan", () => {
  it("memuat semua laporan satu kali saat dibuka", async () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument();
    expect(await screen.findByText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.getByText("Kunci Motor")).toBeInTheDocument();
    expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(1);
  });

  it("menampilkan cover, tulisan 'Tanpa cover', nama pelapor, dan tautan detail", async () => {
    renderWithProviders(<HomePage />);

    const cover = await screen.findByAltText("Dompet Hitam");
    expect(cover.getAttribute("src")).toContain(
      "/img/lost-founds/cover/1.png"
    );
    expect(screen.getByText("Tanpa cover")).toBeInTheDocument();
    expect(screen.getByText(/^Budi/)).toBeInTheDocument();
    expect(screen.getByText(/^Ani/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Dompet Hitam/ })
    ).toHaveAttribute("href", "/lost-founds/1");
    expect(
      screen.getByRole("link", { name: /Kunci Motor/ })
    ).toHaveAttribute("href", "/lost-founds/2");
  });

  it("menandai laporan yang sudah selesai", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    // satu pada kartu ringkasan, satu pada label laporan "Kunci Motor"
    expect(screen.getAllByText("Selesai")).toHaveLength(2);
  });

  it("menampilkan pesan jika tidak ada laporan", async () => {
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: [] },
    });

    renderWithProviders(<HomePage />);

    expect(
      await screen.findByText("Belum ada laporan yang cocok.")
    ).toBeInTheDocument();
  });
});

describe("HomePage - kartu ringkasan", () => {
  it("menampilkan angka 0 sebelum laporan dimuat", () => {
    lostFoundApi.getLostFounds.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<HomePage />);

    expect(cardValue("Total")).toHaveTextContent("0");
    expect(cardValue("Hilang")).toHaveTextContent("0");
    expect(cardValue("Ditemukan")).toHaveTextContent("0");
    expect(cardValue("Selesai")).toHaveTextContent("0");
  });

  it("menghitung total, hilang, ditemukan, dan selesai dari daftar laporan", async () => {
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: moreItems },
    });

    renderWithProviders(<HomePage />);
    await screen.findByText("Payung Biru");

    expect(cardValue("Total")).toHaveTextContent("3");
    expect(cardValue("Hilang")).toHaveTextContent("2");
    expect(cardValue("Ditemukan")).toHaveTextContent("1");
    expect(cardValue("Selesai")).toHaveTextContent("2");
  });
});

describe("HomePage - filter status", () => {
  it("menyaring daftar tanpa memanggil server lagi dan tanpa mengubah kartu", async () => {
    const user = userEvent.setup();
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: moreItems },
    });
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.click(screen.getByRole("button", { name: "Hilang" }));
    expect(screen.getByText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.getByText("Payung Biru")).toBeInTheDocument();
    expect(screen.queryByText("Kunci Motor")).not.toBeInTheDocument();
    expect(cardValue("Total")).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: "Ditemukan" }));
    expect(screen.getByText("Kunci Motor")).toBeInTheDocument();
    expect(screen.queryByText("Dompet Hitam")).not.toBeInTheDocument();
    expect(screen.queryByText("Payung Biru")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Semua" }));
    expect(screen.getByText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.getByText("Kunci Motor")).toBeInTheDocument();
    expect(screen.getByText("Payung Biru")).toBeInTheDocument();

    expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(1);
  });
});

describe("HomePage - pencarian", () => {
  it("menyaring berdasarkan judul tanpa membedakan huruf besar kecil", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.type(screen.getByLabelText("Cari laporan"), "DOMPET");

    expect(screen.getByText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.queryByText("Kunci Motor")).not.toBeInTheDocument();
  });

  it("menyaring berdasarkan deskripsi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.type(screen.getByLabelText("Cari laporan"), "parkiran");

    expect(screen.getByText("Kunci Motor")).toBeInTheDocument();
    expect(screen.queryByText("Dompet Hitam")).not.toBeInTheDocument();
  });

  it("menampilkan pesan kosong jika tidak ada yang cocok", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.type(screen.getByLabelText("Cari laporan"), "zzz");

    expect(
      screen.getByText("Belum ada laporan yang cocok.")
    ).toBeInTheDocument();
  });

  it("menggabungkan filter status dan pencarian", async () => {
    const user = userEvent.setup();
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: moreItems },
    });
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.click(screen.getByRole("button", { name: "Hilang" }));
    await user.type(screen.getByLabelText("Cari laporan"), "payung");

    expect(screen.getByText("Payung Biru")).toBeInTheDocument();
    expect(screen.queryByText("Dompet Hitam")).not.toBeInTheDocument();
    expect(screen.queryByText("Kunci Motor")).not.toBeInTheDocument();
  });
});

describe("HomePage - tambah laporan", () => {
  it("membuka dan menutup modal tambah laporan", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tambah Laporan" }));
    expect(
      screen.getByRole("dialog", { name: "Tambah Laporan" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("memuat ulang daftar setelah laporan berhasil ditambahkan", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFound.mockResolvedValue({ message: "Ditambahkan" });
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet Hitam");

    await user.click(screen.getByRole("button", { name: "Tambah Laporan" }));
    await user.type(screen.getByLabelText("Judul"), "Payung");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna biru");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFounds).toHaveBeenCalledTimes(2)
    );
    expect(lostFoundApi.postLostFound).toHaveBeenCalledWith(
      "Payung",
      "Warna biru",
      "lost"
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});