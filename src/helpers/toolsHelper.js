// SweetAlert2 dimuat hanya saat dialog pertama kali dibutuhkan (mengurangi unused JavaScript).
async function fire(options) {
  const { default: Swal } = await import("sweetalert2");
  return Swal.fire(options);
}

export function showSuccessDialog(message) {
  return fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonText: "OK",
  });
}

export function showErrorDialog(message) {
  return fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonText: "OK",
  });
}

export async function showConfirmDialog(message, confirmText = "Ya") {
  const result = await fire({
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

  return `${DELCOM_ORIGIN}/${path.replace(/^\//, "")}`;
}