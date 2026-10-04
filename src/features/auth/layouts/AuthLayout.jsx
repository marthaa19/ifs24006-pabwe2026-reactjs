import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconSearch } from "@tabler/icons-react";
import apiHelper from "../../../helpers/apiHelper";

function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  if (isAuthLogin || apiHelper.getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col items-center justify-center bg-indigo-600 p-10 text-white lg:flex">
        <IconSearch size={72} stroke={1.5} />
        <h1 className="mt-6 text-4xl font-extrabold">Lost &amp; Founds</h1>
        <p className="mt-3 max-w-sm text-center text-indigo-100">
          Laporkan barang yang hilang atau temukan pemiliknya dengan mudah.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;