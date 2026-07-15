import axios from 'axios';

export type UploadableAsset = {
  dataUri?: string;
  uri: string;
  name: string;
  mimeType?: string;
  webFile?: Blob;
};

type CloudinaryResponse = {
  url?: string;
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  error?: {
    message?: string;
  };
};

export type UploadResult = {
  fileUrl: string;
  storagePath?: string;
  provider: 'cloudinary';
};

export type UploadProgressHandler = (progress: number) => void;

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dd5bk5dti';
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'quickDropUpload';

export const isCloudinaryReady = () => Boolean(cloudName && uploadPreset);

const getMimeType = (fileName: string, fallback?: string): string => {
  if (fallback) return fallback;

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return 'application/octet-stream';
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'txt') return 'text/plain';
  if (ext === 'csv') return 'text/csv';
  if (ext === 'doc') return 'application/msword';
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
};

const assertCloudinarySuccess = (
  result: CloudinaryResponse,
  ok: boolean
): UploadResult => {
  if (!ok) {
    throw new Error(result.error?.message ?? 'Cloudinary upload failed.');
  }

  const fileUrl = result.secure_url ?? result.url;
  if (!fileUrl) {
    throw new Error('Cloudinary did not return a file URL.');
  }

  return {
    fileUrl,
    storagePath: result.public_id,
    provider: 'cloudinary',
  };
};

export const uploadDocumentToCloudinary = async (
  asset: UploadableAsset,
  onProgress?: UploadProgressHandler
): Promise<UploadResult> => {
  if (!isCloudinaryReady()) {
    throw new Error('Cloudinary cloud name and upload preset are required.');
  }

  const mimeType = getMimeType(asset.name, asset.mimeType);
  const body = new FormData();

  if (asset.webFile) {
    body.append('file', asset.webFile, asset.name);
  } else if (asset.dataUri) {
    body.append('file', asset.dataUri);
  } else {
    body.append('file', {
      uri: asset.uri,
      name: asset.name,
      type: mimeType,
    } as unknown as File);
  }

  body.append('upload_preset', uploadPreset);

  const response = await axios.post<CloudinaryResponse>(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    body,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 30000,
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      },
    }
  );

  return assertCloudinarySuccess(response.data, response.status >= 200 && response.status < 300);
};
