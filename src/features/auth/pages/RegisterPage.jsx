import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthRegister } from "../states/action";

function validate(name, email, password) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Nama wajib diisi";
  }

  if (!email.trim()) {
    errors.email = "Email wajib diisi";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Format email tidak valid";
  }

  if (!password) {
    errors.password = "Kata sandi wajib diisi";
  } else if (password.length < 6) {
    errors.password = "Kata sandi minimal 6 karakter";
  }

  return errors;
}

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, handleNameChange] = useInput("");
  const [email, handleEmailChange] = useInput("");
  const [password, handlePasswordChange] = useInput("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate(name, email, password);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    const isSuccess = await dispatch(
      asyncSetIsAuthRegister(name, email, password)
    );
    setIsLoading(false);

    if (isSuccess) {
      navigate("/auth/login");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Daftar</h1>
      <p className="mt-1 text-sm text-slate-600">
        Buat akun baru untuk mulai melapor.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="register-name-input"
            className="mb-1 block text-sm font-medium"
          >
            Nama
          </label>
          <input
            id="register-name-input"
            name="name"
            autoComplete="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Nama lengkap"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-700">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email-input"
            className="mb-1 block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="register-email-input"
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
            htmlFor="register-password-input"
            className="mb-1 block text-sm font-medium"
          >
            Kata Sandi
          </label>
          <input
            id="register-password-input"
            name="password"
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Minimal 6 karakter"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-700">{errors.password}</p>
          )}
        </div>

        <button
          id="register-submit-button"
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isLoading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-indigo-600 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;