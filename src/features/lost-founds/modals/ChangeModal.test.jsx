import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ChangeModal from "./ChangeModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { putLostFound: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const baseLostFound = {
  id: 5,
  title: "Dompet",
  description: "Warna hitam",
  status: "lost",
  is_completed: 0,
};

function renderModal(lostFound = baseLostFound) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  renderWithProviders(
    <ChangeModal
      lostFound={lostFound}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
  return { onClose, onSuccess };
}

describe("ChangeModal", () => {
  it("mengisi form dengan data laporan saat ini", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: "Ubah Laporan" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Dompet");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Warna hitam");
    expect(screen.getByLabelText("Status")).toHaveValue("lost");
    expect(screen.getByLabelText("Tandai sebagai selesai")).not.toBeChecked();
  });

  it("mencentang kotak selesai jika laporan sudah selesai", () => {
    renderModal({ ...baseLostFound, is_completed: 1 });

    expect(screen.getByLabelText("Tandai sebagai selesai")).toBeChecked();
  });

  it("menampilkan pesan error jika judul dan deskripsi dikosongkan", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.clear(screen.getByLabelText("Judul"));
    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(lostFoundApi.putLostFound).not.toHaveBeenCalled();
  });

  it("hanya menampilkan error judul jika hanya judul yang dikosongkan", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.clear(screen.getByLabelText("Judul"));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(
      screen.queryByText("Deskripsi wajib diisi")
    ).not.toBeInTheDocument();
  });

  it("hanya menampilkan error deskripsi jika hanya deskripsi yang dikosongkan", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(screen.queryByText("Judul wajib diisi")).not.toBeInTheDocument();
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
  });

  it("menyimpan perubahan lalu menutup modal jika berhasil", async () => {
    const user = userEvent.setup();
    lostFoundApi.putLostFound.mockResolvedValue({ message: "Diubah" });
    const { onClose, onSuccess } = renderModal();

    await user.clear(screen.getByLabelText("Judul"));
    await user.type(screen.getByLabelText("Judul"), "Dompet Baru");
    await user.selectOptions(screen.getByLabelText("Status"), "found");
    await user.click(screen.getByLabelText("Tandai sebagai selesai"));
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.putLostFound).toHaveBeenCalledWith(
      5,
      "Dompet Baru",
      "Warna hitam",
      "found",
      true
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status 'Menyimpan...' selama proses berjalan", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    lostFoundApi.putLostFound.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(
      await screen.findByRole("button", { name: "Menyimpan..." })
    ).toBeDisabled();

    resolveRequest({ message: "Diubah" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("tetap terbuka dan menampilkan dialog error jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.putLostFound.mockRejectedValue(new Error("Gagal mengubah"));
    const { onClose, onSuccess } = renderModal();

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengubah")
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