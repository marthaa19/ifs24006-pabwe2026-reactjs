import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
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
      return;
    }

    dispatch(asyncSetProfile()).then(() => setIsReady(true));
  }, [dispatch, hasToken]);

  if (!hasToken) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-600">
        Memuat...
      </main>
    );
  }

  if (!profile) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent onToggleSidebar={() => setIsSidebarOpen(true)} />
      <div className="flex">
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LostFoundLayout;