import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toImageUrl } from "../../../helpers/toolsHelper";
import { asyncSetUsers } from "../states/action";

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(asyncSetUsers());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Pengguna</h1>
      <p className="mt-1 text-sm text-slate-600">
        Daftar seluruh pengguna yang terdaftar.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow"
          >
            {user.photo ? (
              <img
                src={toImageUrl(user.photo)}
                alt={user.name}
                width="56"
                height="56"
                loading="lazy"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-slate-600">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;