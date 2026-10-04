import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile } from "../../users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);

  const [isReady, setIsReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hasToken = Boolean(apiHelper.getAccessToken());

  useEffect(() => {
    if (!hasToken) {
      setIsReady(true);
      return;
    }

    dispatch(asyncSetProfile())
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, [dispatch, hasToken]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      <div className="flex">
        {hasToken && profile && (
          <SidebarComponent
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LostFoundLayout;