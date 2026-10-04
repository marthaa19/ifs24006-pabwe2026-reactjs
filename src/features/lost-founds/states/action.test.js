import { describe, expect, it, vi } from "vitest";
import lostFoundApi from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  ActionType,
  asyncSetIsAddLostFound,
  asyncSetIsChangeCoverLostFound,
  asyncSetIsChangeLostFound,
  asyncSetIsDeleteLostFound,
  asyncSetLostFound,
  asyncSetLostFoundStats,
  asyncSetLostFounds,
  setIsAddLostFoundActionCreator,
  setIsChangeCoverLostFoundActionCreator,
  setIsChangeLostFoundActionCreator,
  setIsDeleteLostFoundActionCreator,
  setLostFoundActionCreator,
  setLostFoundStatsActionCreator,
  setLostFoundsActionCreator,
} from "./action";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFoundById: vi.fn(),
    getStatsDaily: vi.fn(),
    postLostFound: vi.fn(),
    putLostFound: vi.fn(),
    postLostFoundCover: vi.fn(),
    deleteLostFound: vi.fn(),
  },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("action creator lost-founds", () => {
  it("membentuk aksi yang benar", () => {
    expect(setLostFoundsActionCreator([{ id: 1 }])).toEqual({
      type: ActionType.SET_LOST_FOUNDS,
      payload: { lostFounds: [{ id: 1 }] },
    });
    expect(setLostFoundActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_LOST_FOUND,
      payload: { lostFound: { id: 1 } },
    });
    expect(setLostFoundStatsActionCreator({ stats_losts: {} })).toEqual({
      type: ActionType.SET_LOST_FOUND_STATS,
      payload: { stats: { stats_losts: {} } },
    });
    expect(setIsAddLostFoundActionCreator(true)).toEqual({
      type: ActionType.SET_IS_ADD_LOST_FOUND,
      payload: { status: true },
    });
    expect(setIsChangeLostFoundActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_LOST_FOUND,
      payload: { status: true },
    });
    expect(setIsChangeCoverLostFoundActionCreator(false)).toEqual({
      type: ActionType.SET_IS_CHANGE_COVER_LOST_FOUND,
      payload: { status: false },
    });
    expect(setIsDeleteLostFoundActionCreator(true)).toEqual({
      type: ActionType.SET_IS_DELETE_LOST_FOUND,
      payload: { status: true },
    });
  });
});

describe("asyncSetLostFounds", () => {
  it("menyimpan daftar laporan jika berhasil", async () => {
    const dispatch = vi.fn();
    lostFoundApi.getLostFounds.mockResolvedValue({
      data: { lost_founds: [{ id: 1 }] },
    });

    await asyncSetLostFounds({ status: "lost" })(dispatch);

    expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ status: "lost" });
    expect(dispatch).toHaveBeenCalledWith(
      setLostFoundsActionCreator([{ id: 1 }])
    );
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.getLostFounds.mockRejectedValue(new Error("Gagal memuat"));

    await asyncSetLostFounds()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("asyncSetLostFound", () => {
  it("menyimpan satu laporan jika berhasil", async () => {
    const dispatch = vi.fn();
    lostFoundApi.getLostFoundById.mockResolvedValue({
      data: { lost_found: { id: 5 } },
    });

    await asyncSetLostFound(5)(dispatch);

    expect(lostFoundApi.getLostFoundById).toHaveBeenCalledWith(5);
    expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator({ id: 5 }));
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.getLostFoundById.mockRejectedValue(new Error("Tidak ada"));

    await asyncSetLostFound(5)(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ada");
  });
});

describe("asyncSetLostFoundStats", () => {
  it("menyimpan data statistik jika berhasil", async () => {
    const dispatch = vi.fn();
    const data = { stats_losts: { "01-10-2024": 1 } };
    lostFoundApi.getStatsDaily.mockResolvedValue({ data });

    await asyncSetLostFoundStats()(dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      setLostFoundStatsActionCreator(data)
    );
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.getStatsDaily.mockRejectedValue(new Error("Gagal statistik"));

    await asyncSetLostFoundStats()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal statistik");
  });
});

describe("asyncSetIsAddLostFound", () => {
  it("menampilkan dialog sukses jika berhasil", async () => {
    const dispatch = vi.fn();
    lostFoundApi.postLostFound.mockResolvedValue({ message: "Ditambahkan" });

    const result = await asyncSetIsAddLostFound(
      "Dompet",
      "Hitam",
      "lost"
    )(dispatch);

    expect(lostFoundApi.postLostFound).toHaveBeenCalledWith(
      "Dompet",
      "Hitam",
      "lost"
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Ditambahkan");
    expect(dispatch).toHaveBeenCalledWith(setIsAddLostFoundActionCreator(true));
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.postLostFound.mockRejectedValue(new Error("Data tidak valid"));

    const result = await asyncSetIsAddLostFound(
      "Dompet",
      "Hitam",
      "lost"
    )(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(dispatch).toHaveBeenCalledWith(
      setIsAddLostFoundActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsChangeLostFound", () => {
  it("menampilkan dialog sukses jika berhasil", async () => {
    const dispatch = vi.fn();
    lostFoundApi.putLostFound.mockResolvedValue({ message: "Diubah" });

    const result = await asyncSetIsChangeLostFound(
      5,
      "Dompet",
      "Hitam",
      "found",
      true
    )(dispatch);

    expect(lostFoundApi.putLostFound).toHaveBeenCalledWith(
      5,
      "Dompet",
      "Hitam",
      "found",
      true
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeLostFoundActionCreator(true)
    );
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.putLostFound.mockRejectedValue(new Error("Gagal mengubah"));

    const result = await asyncSetIsChangeLostFound(
      5,
      "Dompet",
      "Hitam",
      "found",
      false
    )(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengubah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeLostFoundActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsChangeCoverLostFound", () => {
  it("menampilkan dialog sukses jika berhasil", async () => {
    const dispatch = vi.fn();
    const file = new File(["x"], "cover.png");
    lostFoundApi.postLostFoundCover.mockResolvedValue({ message: "Cover diubah" });

    const result = await asyncSetIsChangeCoverLostFound(5, file)(dispatch);

    expect(lostFoundApi.postLostFoundCover).toHaveBeenCalledWith(5, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover diubah");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeCoverLostFoundActionCreator(true)
    );
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika gagal", async () => {
    const dispatch = vi.fn();
    lostFoundApi.postLostFoundCover.mockRejectedValue(new Error("File besar"));

    const result = await asyncSetIsChangeCoverLostFound(
      5,
      new File(["x"], "a.png")
    )(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("File besar");
    expect(dispatch).toHaveBeenCalledWith(
      setIsChangeCoverLostFoundActionCreator(false)
    );
    expect(result).toBe(false);
  });
});

describe("asyncSetIsDeleteLostFound", () => {
  it("tidak menghapus jika pengguna membatalkan konfirmasi", async () => {
    const dispatch = vi.fn();
    showConfirmDialog.mockResolvedValue(false);

    const result = await asyncSetIsDeleteLostFound(5)(dispatch);

    expect(lostFoundApi.deleteLostFound).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("menghapus dan menampilkan dialog sukses jika dikonfirmasi", async () => {
    const dispatch = vi.fn();
    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockResolvedValue({ message: "Dihapus" });

    const result = await asyncSetIsDeleteLostFound(5)(dispatch);

    expect(showConfirmDialog).toHaveBeenCalledWith(
      "Apakah Anda yakin ingin menghapus laporan ini?",
      "Hapus"
    );
    expect(lostFoundApi.deleteLostFound).toHaveBeenCalledWith(5);
    expect(showSuccessDialog).toHaveBeenCalledWith("Dihapus");
    expect(dispatch).toHaveBeenCalledWith(
      setIsDeleteLostFoundActionCreator(true)
    );
    expect(result).toBe(true);
  });

  it("menampilkan dialog error jika penghapusan gagal", async () => {
    const dispatch = vi.fn();
    showConfirmDialog.mockResolvedValue(true);
    lostFoundApi.deleteLostFound.mockRejectedValue(new Error("Gagal menghapus"));

    const result = await asyncSetIsDeleteLostFound(5)(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal menghapus");
    expect(dispatch).toHaveBeenCalledWith(
      setIsDeleteLostFoundActionCreator(false)
    );
    expect(result).toBe(false);
  });
});