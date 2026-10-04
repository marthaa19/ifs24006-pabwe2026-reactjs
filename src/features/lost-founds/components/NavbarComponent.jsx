import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconLogout, IconMenu2, IconSearch } from "@tabler/icons-react";
import { toImageUrl } from "../../../helpers/toolsHelper";
import { asyncSetIsAuthLogout } from "../../auth/states/action";

function NavbarComponent({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);

  const handleLogout = () => {
    dispatch(asyncSetIsAuthLogout());
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <IconMenu2 size={24} />
        </button>
        <div className="flex items-center gap-2 text-indigo-600">
          <IconSearch size={26} />
          <span className="text-lg font-extrabold">Lost &amp; Founds</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {profile.photo ? (
            <img
              src={toImageUrl(profile.photo)}
              alt={profile.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden text-sm font-medium sm:block">
            {profile.name}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <IconLogout size={20} />
          <span className="hidden sm:block">Keluar</span>
        </button>
      </div>
    </header>
  );
}

export default NavbarComponent;