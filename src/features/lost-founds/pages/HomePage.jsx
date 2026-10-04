import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import { formatDate, toImageUrl } from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal";
import {
  asyncSetLostFounds,
  asyncSetLostFoundStats,
} from "../states/action";

const filters = [
  { value: "", label: "Semua" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

function sumValues(record) {
  return Object.values(record || {}).reduce((total, value) => total + value, 0);
}

function HomePage() {
  const dispatch = useDispatch();
  const lostFounds = useSelector((state) => state.lostFounds);
  const lostFoundStats = useSelector((state) => state.lostFoundStats);

  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, handleKeywordChange] = useInput("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncSetLostFounds({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    dispatch(asyncSetLostFoundStats());
  }, [dispatch]);

  const handleAddSuccess = () => {
    dispatch(asyncSetLostFounds({ status: statusFilter }));
    dispatch(asyncSetLostFoundStats());
  };

  const totalLost = sumValues(lostFoundStats?.stats_losts);
  const totalFound = sumValues(lostFoundStats?.stats_founds);
  const totalCompleted =
    sumValues(lostFoundStats?.stats_losts_completed) +
    sumValues(lostFoundStats?.stats_founds_completed);

  const summaries = [
    { label: "Total", value: totalLost + totalFound, color: "text-indigo-600" },
    { label: "Hilang", value: totalLost, color: "text-red-600" },
    { label: "Ditemukan", value: totalFound, color: "text-emerald-600" },
    { label: "Selesai", value: totalCompleted, color: "text-slate-700" },
  ];

  const lowerKeyword = keyword.trim().toLowerCase();
  const visibleLostFounds = lostFounds.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.description.toLowerCase().includes(lowerKeyword)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan statistik harian dan daftar laporan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          <IconPlus size={20} />
          Tambah Laporan
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaries.map((summary) => (
          <div key={summary.label} className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-slate-500">{summary.label}</p>
            <p className={clsx("mt-1 text-3xl font-extrabold", summary.color)}>
              {summary.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                statusFilter === filter.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 shadow hover:bg-slate-100"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            aria-label="Cari laporan"
            placeholder="Cari judul atau deskripsi..."
            value={keyword}
            onChange={handleKeywordChange}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {visibleLostFounds.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">
          Belum ada laporan yang cocok.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleLostFounds.map((item) => (
            <Link
              key={item.id}
              to={`/lost-founds/${item.id}`}
              className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
            >
              <div className="flex h-40 items-center justify-center bg-slate-100">
                {item.cover ? (
                  <img
                    src={toImageUrl(item.cover)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-slate-400">Tanpa cover</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      item.status === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {item.status === "lost" ? "Hilang" : "Ditemukan"}
                  </span>
                  {item.is_completed === 1 && (
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      Selesai
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {item.description}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  {item.author.name} · {formatDate(item.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isAddOpen && (
        <AddModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}

export default HomePage;