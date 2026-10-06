import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAddLostFound } from "../states/action";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";

function AddModal({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [title, handleTitleChange] = useInput("");
  const [description, handleDescriptionChange] = useInput("");
  const [status, handleStatusChange] = useInput("lost");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Judul wajib diisi";
    }
    if (!description.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const isSuccess = await dispatch(
      asyncSetIsAddLostFound(title, description, status)
    );
    setIsLoading(false);

    if (isSuccess) {
      onClose();
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="add-modal-title" className="text-lg font-bold">
            Tambah Laporan
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          >
            <IconX size={22} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="add-title"
              className="mb-1 block text-sm font-medium"
            >
              Judul
            </label>
            <input
              id="add-title"
              name="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              className={inputClass}
            />
            {errors.title && (
              <p className="mt-1 text-sm    text-red-700">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-description"
              className="mb-1 block text-sm font-medium"
            >
              Deskripsi
            </label>
            <textarea
              id="add-description"
              name="description"
              rows={4}
              value={description}
              onChange={handleDescriptionChange}
              className={inputClass}
            />
            {errors.description && (
              <p className="mt-1 text-sm    text-red-700">{errors.description}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="add-status"
              className="mb-1 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="add-status"
              name="status"
              value={status}
              onChange={handleStatusChange}
              className={inputClass}
            >
              <option value="lost">Hilang</option>
              <option value="found">Ditemukan</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddModal;