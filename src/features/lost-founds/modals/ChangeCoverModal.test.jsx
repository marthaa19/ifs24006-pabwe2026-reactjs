import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/lostFoundApi", () => ({
  default: { postLostFoundCover: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const withoutCover = { id: 5, cover: null };
const withCover = { id: 5, cover: "img/lost-founds/cover/5.png" };

function renderModal(lostFound = withoutCover) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  renderWithProviders(
    <ChangeCoverModal
      lostFound={lostFound}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
  return { onClose, onSuccess };
}

const imageFile = () => new File(["x"], "cover.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  it("menampilkan 'Belum ada cover' jika laporan belum punya cover", () => {
    renderModal(withoutCover);

    expect(
      screen.getByRole("dialog", { name: "Ubah Cover" })
    ).toBeInTheDocument();
    expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
  });

  it("menampilkan cover saat ini jika laporan sudah punya cover", () => {
    renderModal(withCover);

    const image = screen.getByAltText("Pratinjau cover");
    expect(image.getAttribute("src")).toContain(
      "/img/lost-founds/cover/5.png"
    );
    expect(screen.queryByText("Belum ada cover")).not.toBeInTheDocument();
  });

  it("menampilkan pesan error jika menekan Unggah tanpa memilih gambar", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Unggah" }));

    expect(
      screen.getByText("Pilih gambar terlebih dahulu")
    ).toBeInTheDocument();
    expect(lostFoundApi.postLostFoundCover).not.toHaveBeenCalled();
  });

  it("menampilkan pratinjau setelah memilih gambar dan menghapusnya saat pilihan dibatalkan", async () => {
    const user = userEvent.setup();
    renderModal();
    const input = screen.getByLabelText("Pilih gambar");

    await user.upload(input, imageFile());
    expect(
      screen.getByAltText("Pratinjau cover").getAttribute("src")
    ).toBe("blob:pratinjau");

    fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByAltText("Pratinjau cover")).not.toBeInTheDocument();
    expect(screen.getByText("Belum ada cover")).toBeInTheDocument();
  });

  it("mengunggah cover lalu menutup modal jika berhasil", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFoundCover.mockResolvedValue({
      message: "Cover diubah",
    });
    const { onClose, onSuccess } = renderModal();

    await user.upload(screen.getByLabelText("Pilih gambar"), imageFile());
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(lostFoundApi.postLostFoundCover).toHaveBeenCalledTimes(1);
    const [id, file] = lostFoundApi.postLostFoundCover.mock.calls[0];
    expect(id).toBe(5);
    expect(file.name).toBe("cover.png");
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover diubah");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("menampilkan status 'Mengunggah...' selama proses berjalan", async () => {
    const user = userEvent.setup();
    let resolveRequest;
    lostFoundApi.postLostFoundCover.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );
    const { onClose } = renderModal();

    await user.upload(screen.getByLabelText("Pilih gambar"), imageFile());
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    expect(
      await screen.findByRole("button", { name: "Mengunggah..." })
    ).toBeDisabled();

    resolveRequest({ message: "Cover diubah" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("tetap terbuka dan menampilkan dialog error jika gagal", async () => {
    const user = userEvent.setup();
    lostFoundApi.postLostFoundCover.mockRejectedValue(
      new Error("File terlalu besar")
    );
    const { onClose, onSuccess } = renderModal();

    await user.upload(screen.getByLabelText("Pilih gambar"), imageFile());
    await user.click(screen.getByRole("button", { name: "Unggah" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar")
    );
    expect(screen.getByRole("button", { name: "Unggah" })).toBeEnabled();
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