export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Konfigurasi Cloudinary tidak lengkap');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'umkm-bahan-baku');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Gagal upload gambar: respons server tidak valid');
  }

  if (!response.ok) {
    throw new Error(result?.error?.message || 'Gagal upload gambar');
  }

  return result.secure_url;
}
