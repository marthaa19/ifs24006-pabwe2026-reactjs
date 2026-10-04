import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconEdit,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import { formatDate, toImageUrl } from "../../../helpers/toolsHelper";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import { asyncSetIsDeleteLostFound, asyncSetLostFound } from "../states/action";

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((state) => state.lostFound);
  const profile = useSelector((state) => state.profile);

  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFound(id));
  }, [dispatch, id]);

  const handleRefresh = () => {
    dispatch(asyncSetLostFound(id));
  };

  const handleDelete = async () => {
    const isSuccess = await dispatch(asyncSetIsDeleteLostFound(id));

    if (isSuccess) {
      navigate("/");
    }
  };

  if (!lostFound || lostFound.id !== Number(id)) {
    return <p className="text-center text-slate-500">Memuat...</p>;
  }

  const isOwner = profile.id === lostFound.user_id;
  const authorPhoto = toImageUrl(lostFound.author.photo);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
      >
        <IconArrowLeft size={18} />
        Kembali
      </Link>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="flex h-64 items-center justify-center bg-slate-100">
          {lostFound.cover ? (
            <img
              src={toImageUrl(lostFound.cover)}
              alt={lostFound.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-slate-400">Tanpa cover</span>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-sm font-semibold",
                lostFound.status === "lost"
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              {lostFound.status === "lost" ? "Hilang" : "Ditemukan"}
            </span>
            {lostFound.is_completed === 1 && (
              <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                Selesai
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold">{lostFound.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            {authorPhoto ? (
              <img
                src={authorPhoto}
                alt={lostFound.author.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                {lostFound.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{lostFound.author.name}</p>
              <p className="text-xs text-slate-400">
                Dibuat {formatDate(lostFound.created_at)}
              </p>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-line text-slate-700">
            {lostFound.description}
          </p>

          {isOwner && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsCoverOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
              >
                <IconPhoto size={18} />
                Ubah Cover
              </button>
              <button
                type="button"
                onClick={() => setIsChangeOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <IconEdit size={18} />
                Ubah Data
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <IconTrash size={18} />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      {isChangeOpen && (
        <ChangeModal
          lostFound={lostFound}
          onClose={() => setIsChangeOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {isCoverOpen && (
        <ChangeCoverModal
          lostFound={lostFound}
          onClose={() => setIsCoverOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}

export default DetailPage;