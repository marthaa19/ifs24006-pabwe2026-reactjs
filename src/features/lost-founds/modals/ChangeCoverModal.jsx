import { useState } from "react";
import { useDispatch } from "react-redux";
import { IconX } from "@tabler/icons-react";
import { toImageUrl } from "../../../helpers/toolsHelper";
import { asyncSetIsChangeCoverLostFound } from "../states/action";

function ChangeCoverModal({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0] || null;
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }

    setError("");
    setIsLoading(true);
    const isSuccess = await dispatch(
      asyncSetIsChangeCoverLostFound(lostFound.id, file)
    );
    setIsLoading(false);

    if (isSuccess) {
      onClose();
      onSuccess();
    }
  };

  const imageSrc = preview || toImageUrl(lostFound.cover);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="cover-modal-title" className="text-lg font-bold">
            Ubah Cover
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <IconX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Pratinjau cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-slate-400">Belum ada cover</span>
            )}
          </div>

          <div>
            <label
              htmlFor="cover-file"
              className="mb-1 block text-sm font-medium"
            >
              Pilih gambar
            </label>
            <input
              id="cover-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
              {isLoading ? "Mengunggah..." : "Unggah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeCoverModal;