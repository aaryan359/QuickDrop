import type { UploadResult } from '../types';

type SignedUploadResponse = {
  uploadUrl: string;
  fileUrl: string;
  method?: 'POST' | 'PUT';
  fields?: Record<string, string>;
};

const fileApiBaseUrl = import.meta.env.VITE_FILE_API_BASE_URL;
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Later this can point to a private Cloudinary/S3/custom backend that returns
// signed upload data. Until then, files stay local as data URLs.
const readAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed.'));
    reader.readAsDataURL(file);
  });
};

const requestSignedUpload = async (file: File): Promise<SignedUploadResponse> => {
  if (!fileApiBaseUrl) {
    throw new Error('VITE_FILE_API_BASE_URL is required for signed uploads.');
  }

  const response = await fetch(`${fileApiBaseUrl}/uploads/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create signed upload URL.');
  }

  return response.json();
};

const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error('Cloudinary cloud name and upload preset are required.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
    { method: 'POST', body }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed.');
  }

  const result = await response.json();
  if (typeof result.secure_url !== 'string') {
    throw new Error('Cloudinary response did not include a file URL.');
  }

  return {
    fileUrl: result.secure_url,
    storagePath: typeof result.public_id === 'string' ? result.public_id : undefined,
    provider: 'cloudinary',
  };
};

const uploadToSignedUrl = async (
  file: File,
  signedUpload: SignedUploadResponse
): Promise<string | undefined> => {
  if (signedUpload.fields) {
    const body = new FormData();
    Object.entries(signedUpload.fields).forEach(([key, value]) => body.append(key, value));
    body.append('file', file);
    const response = await fetch(signedUpload.uploadUrl, { method: 'POST', body });
    if (!response.ok) throw new Error('Signed form upload failed.');
    const result = await response.json();
    return typeof result.secure_url === 'string' ? result.secure_url : undefined;
  }

  const response = await fetch(signedUpload.uploadUrl, {
    method: signedUpload.method ?? 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Signed file upload failed.');
  }

  return undefined;
};

export const uploadFile = async (file: File): Promise<UploadResult> => {
  if (cloudinaryCloudName && cloudinaryUploadPreset) {
    return uploadToCloudinary(file);
  }

  if (!fileApiBaseUrl) {
    return {
      fileUrl: await readAsDataUrl(file),
      provider: 'local',
    };
  }

  const signedUpload = await requestSignedUpload(file);
  const uploadedFileUrl = await uploadToSignedUrl(file, signedUpload);

  return {
    fileUrl: uploadedFileUrl ?? signedUpload.fileUrl,
    provider: 'signed-url',
  };
};
