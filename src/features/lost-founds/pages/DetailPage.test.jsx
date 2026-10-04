import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import lostFoundApi from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import DetailPage from "./DetailPage";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFoundById: vi.fn(),
    putLostFound: vi.fn(),
    postLostFoundCover: vi.fn(),
    deleteLostFound: vi.fn(),
  },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const owner = { id: 1, name: "Budi", email: "budi@x.com", photo: null };
const other = { id: 2, name: "Ani", email: "ani@x.com", photo: null };

const lostItem = {
  id: 5,
  user_id: 1,
  title: "Dompet Hitam",
  description: "Hilang di kantin",
  status: "lost",
  is_completed: 0,
  cover: "img/lost-founds/cover/5.png",
  created_at: "2024-02-28T07:49:32.000000Z",
  author: { name: "Budi", photo: null },
};

const foundItem = {
  ...lostItem,
  title: "Kunci Motor",
  status: "found",
  is_completed: 1,
  cover: null,
  author: { name: "Citra", photo: "img/profile/3.png" },
};

function renderDetail({ profile = owner, preloadedState } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<div>Dashboard</div>} />
    </Routes>,
    {
      route: "/lost-founds/5",
      preloadedState: { profile, ...preloadedState },
    }
  );
}

function mockDetail(item) {
  lostFoundApi.getLostFoundById.mockResolvedValue({
    data: { lost_found: item },
  });
}

describe("DetailPage - pemuatan data", () => {
  it("menampilkan 'Memuat...' lalu rincian laporan", async () => {
    mockDetail(lostItem);

    renderDetail();

    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Dompet Hitam" })
    ).toBeInTheDocument();
    expect(lostFoundApi.getLostFoundById).toHaveBeenCalledWith("5");
  });

  it("tidak menampilkan data laporan lain yang tersisa di store", async () => {
    lostFoundApi.getLostFoundById.mockReturnValue(new Promise(() => {}));

    renderDetail({
      preloadedState: { lostFound: { ...lostItem, id: 99, title: "Basi" } },
    });

    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(screen.queryByText("Basi")).not.toBeInTheDocument();
  });
});

describe("DetailPage - tampilan rincian", () => {
  it("menampilkan laporan barang hilang yang belum selesai", async () => {
    mockDetail(lostItem);

    renderDetail();

    expect(await screen.findByText("Dompet Hitam")).toBeInTheDocument();
    expect(screen.getByText("Hilang")).toBeInTheDocument();
    expect(screen.queryByText("Selesai")).not.toBeInTheDocument();
    expect(screen.getByText("Hilang di kantin")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText(/Dibuat/)).toBeInTheDocument();
    expect(
      screen.getByAltText("Dompet Hitam").getAttribute("src")
    ).toContain("/img/lost-founds/cover/5.png");
    expect(screen.queryByText("Tanpa cover")).not.toBeInTheDocument();
  });

  it("menampilkan laporan barang temuan yang sudah selesai dengan foto pelapor", async () => {
    mockDetail(foundItem);

    renderDetail();

    expect(await screen.findByText("Kunci Motor")).toBeInTheDocument();
    expect(screen.getByText("Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByText("Tanpa cover")).toBeInTheDocument();
    expect(screen.getByAltText("Citra").getAttribute("src")).toContain(
      "/img/profile/3.png"
    );
  });

  it("memiliki tautan kembali ke dashboard", async () => {
    mockDetail(lostItem);

    renderDetail();

    expect(
      await screen.findByRole("link", { name: /Kembali/ })
    ).toHaveAttribute("href", "/");
  });
});

describe("DetailPage - hak akses", () => {
  it("menampilkan tombol aksi untuk pemilik laporan", async () => {
    mockDetail(lostItem);

    renderDetail({ profile: owner });

    expect(
      await screen.findByRole("button", { name: "Ubah Cover" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubah Data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeInTheDocument();
  });

  it("menyembunyikan tombol aksi untuk pengguna lain", async () => {
    mockDetail(lostItem);

    renderDetail({ profile: other });

    await screen.findByText("Dompet Hitam");
    expect(
      screen.queryByRole("button", { name: "Ubah Cover" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ubah Data" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Hapus" })
    ).not.toBeInTheDocument();
  });
});

describe("DetailPage - ubah data", () => {
  it("membuka dan menutup modal ubah data", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Ubah Data" }));
    expect(
      screen.getByRole("dialog", { name: "Ubah Laporan" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menyimpan perubahan lalu memuat ulang rincian", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    lostFoundApi.putLostFound.mockResolvedValue({ message: "Diubah" });
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Ubah Data" }));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFoundById).toHaveBeenCalledTimes(2)
    );
    expect(lostFoundApi.putLostFound).toHaveBeenCalledWith(
      5,
      "Dompet Hitam",
      "Hilang di kantin",
      "lost",
      false
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("DetailPage - ubah cover", () => {
  it("membuka dan menutup modal ubah cover", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Ubah Cover" }));
    expect(
      screen.getByRole("dialog", { name: "Ubah Cover" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mengunggah cover baru lalu memuat ulang rincian", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    lostFoundApi.postLostFoundCover.mockResolvedValue({
      message: "Cover diubah",
    });
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Ubah Cover" }));
    await user.upload(
      screen.getByLabelText("Pilih gambar"),
      new File(["x"], "cover.png", { type: "image/png" })
    );
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() =>
      expect(lostFoundApi.getLostFoundById).toHaveBeenCalledTimes(2)
    );
    expect(lostFoundApi.postLostFoundCover).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("DetailPage - hapus", () => {
  it("menghapus laporan lalu kembali ke dashboard jika dikonfirmasi", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockResolvedValue({ message: "Dihapus" });
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Hapus" }));

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith("5");
  });

  it("tetap di halaman detail jika konfirmasi dibatalkan", async () => {
    const user = userEvent.setup();
    mockDetail(lostItem);
    showConfirmDialog.mockResolvedValue(false);
    renderDetail();

    await user.click(await screen.findByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Dompet Hitam")).toBeInTheDocument();
  });
});