import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import AddModal from "./AddModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { postLostFound: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  renderWithProviders(<AddModal onClose={onClose} onSuccess={onSuccess} />);
  return { onClose, onSuccess };
}

describe("AddModal", () => {
  it("menampilkan form dengan status awal 'Hilang'", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "Tambah Laporan" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("lost");
  });

  it("menampilkan pesan error jika judul dan deskripsi kosong", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(lostFoundApi.postLostFound).not.toHaveBeenCalled();
  });

  it("hanya menampilkan error deskripsi jika judul sudah diisi", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.queryByText("Judul wajib diisi")).not.toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
  });

  it("hanya menampilkan error judul jika deskripsi sudah diisi", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(
      screen.queryByText("Deskripsi wajib diisi")
    ).not.toBeInTheDocument();
  });

  it("menyimpan laporan lalu menutup modal jika berhasil", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFound.mockResolvedValue({ message: "Ditambahkan" });
    const { onClose, onSuccess } = renderModal();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.selectOptions(screen.getByLabelText("Status"), "found");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.postLostFound).toHaveBeenCalledWith(
      "Dompet",
      "Warna hitam",
      "found"
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Ditambahkan");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status 'Menyimpan...' selama proses berjalan", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    lostFoundApi.postLostFound.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { onClose } = renderModal();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(
      await screen.findByRole("button", { name: "Menyimpan..." })
    ).toBeDisabled();

    resolveRequest({ message: "Ditambahkan" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("tetap terbuka dan menampilkan dialog error jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFound.mockRejectedValue(new Error("Data tidak valid"));
    const { onClose, onSuccess } = renderModal();

    await user.type(screen.getByLabelText("Judul"), "Dompet");
    await user.type(screen.getByLabelText("Deskripsi"), "Warna hitam");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Data tidak valid")
    );
    expect(screen.getByRole("button", { name: "Simpan" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menutup modal lewat tombol Tutup dan Batal", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: "Tutup" }));
    await user.click(screen.getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});