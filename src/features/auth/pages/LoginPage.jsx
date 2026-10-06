import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthLogin } from "../states/action";

function validate(email, password) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Format email tidak valid";
  }

  if (!password) {
    errors.password = "Kata sandi wajib diisi";
  }

  return errors;
}

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, handleEmailChange] = useInput("");
  const [password, handlePasswordChange] = useInput("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate(email, password);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const isSuccess = await dispatch(asyncSetIsAuthLogin(email, password));
    setIsLoading(false);

    if (isSuccess) {
      navigate("/");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Masuk</h1>
      <p className="mt-1 text-sm text-slate-600">
        Silakan masuk untuk melanjutkan.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="login-email-input"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="login-email-input"
            name="email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="nama@email.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-700">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password-input"
            className="mb-1 block text-sm font-medium"
          >
            Kata Sandi
          </label>
          <input
            id="login-password-input"
            name="password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Kata sandi"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-700">{errors.password}</p>
          )}
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link
          to="/auth/register"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;