import Swal from "sweetalert2";

export function showSuccessDialog(message) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonText: "OK",
  });
}

export function showErrorDialog(message) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonText: "OK",
  });
}

export async function showConfirmDialog(message, confirmText = "Ya") {
  const result = await Swal.fire({
    icon: "warning",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
  });

  return result.isConfirmed;
}

export function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toImageUrl(path) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const host = DELCOM_BASEURL.replace(/\/api\/v1\/?$/, "");
  return `${host}/${path.replace(/^\//, "")}`;
}