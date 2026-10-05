import clsx from "clsx";
import { NavLink } from "react-router-dom";
import { IconHome, IconUser, IconUsers, IconX } from "@tabler/icons-react";

const menus = [
  { to: "/", label: "Dashboard", icon: IconHome, end: true },
  { to: "/users", label: "Pengguna", icon: IconUsers, end: false },
  { to: "/profile", label: "Profil Saya", icon: IconUser, end: false },
];

function SidebarComponent({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          data-testid="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white p-4 shadow-lg transition-transform lg:static lg:z-auto lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-lg font-extrabold text-indigo-600">Menu</span>

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <IconX size={22} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu utama" className="space-y-1">
          {menus.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 font-medium",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <menu.icon size={22} aria-hidden="true" />
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default SidebarComponent;