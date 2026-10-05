import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { toImageUrl } from "../../../helpers/toolsHelper";
import {
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePassword,
  asyncSetIsChangeProfilePhoto,
} from "../states/action";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";
const buttonClass =
  "rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700";

function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);

  const [name, handleNameChange] = useInput(profile.name);
  const [email, handleEmailChange] = useInput(profile.email);
  const [profileErrors, setProfileErrors] = useState({});

  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const [password, handlePasswordChange, setPassword] = useInput("");
  const [newPassword, handleNewPasswordChange, setNewPassword] = useInput("");
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleSubmitProfile = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!name.trim()) {
      errors.name = "Nama wajib diisi";
    }
    if (!email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format email tidak valid";
    }
    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await dispatch(asyncSetIsChangeProfile(name, email));
  };

  const handlePhotoChange = (event) => {
    setPhotoFile(event.target.files[0] || null);
  };

  const handleSubmitPhoto = async (event) => {
    event.preventDefault();

    if (!photoFile) {
      setPhotoError("Pilih foto terlebih dahulu");
      return;
    }

    setPhotoError("");
    await dispatch(asyncSetIsChangeProfilePhoto(photoFile));
  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!password) {
      errors.password = "Kata sandi lama wajib diisi";
    }
    if (!newPassword) {
      errors.newPassword = "Kata sandi baru wajib diisi";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Kata sandi baru minimal 6 karakter";
    }
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const isSuccess = await dispatch(
      asyncSetIsChangeProfilePassword(password, newPassword)
    );

    if (isSuccess) {
      setPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profil Saya</h1>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Informasi Profil</h2>
        <form
          onSubmit={handleSubmitProfile}
          noValidate
          className="mt-4 space-y-4"
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nama
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className={inputClass}
            />
            {profileErrors.name && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={inputClass}
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
            )}
          </div>
          <button type="submit" className={buttonClass}>
            Simpan Profil
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Foto Profil</h2>
        <form onSubmit={handleSubmitPhoto} className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            {profile.photo ? (
              <img
                src={toImageUrl(profile.photo)}
                alt={profile.name}
                width="64"
                height="64"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <label htmlFor="photo" className="mb-1 block text-sm font-medium">
                Pilih foto
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
          {photoError && <p className="text-sm text-red-600">{photoError}</p>}
          <button type="submit" className={buttonClass}>
            Unggah Foto
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Ganti Kata Sandi</h2>
        <form
          onSubmit={handleSubmitPassword}
          noValidate
          className="mt-4 space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Kata Sandi Lama
            </label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={inputClass}
            />
            {passwordErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.password}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium"
            >
              Kata Sandi Baru
            </label>
            <input
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className={inputClass}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>
          <button type="submit" className={buttonClass}>
            Ganti Kata Sandi
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;