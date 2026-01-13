export type ImageStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  convertedSize: number | null;
  originalWidth: number | null;
  originalHeight: number | null;
  newWidth: number | null;
  newHeight: number | null;
  status: ImageStatus;
  progress: number;
  error: string | null;
  convertedBlob: Blob | null;
  thumbnail: string | null;
}

export interface ConversionSettings {
  quality: number;
  enableResize: boolean;
  maxWidth: number;
  maxHeight: number;
}

export interface ConversionResult {
  id: string;
  success: boolean;
  blob?: Blob;
  size?: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface WorkerMessage {
  type: 'convert';
  id: string;
  imageData: ImageData;
  settings: ConversionSettings;
}

export interface WorkerResponse {
  type: 'result';
  id: string;
  success: boolean;
  blob?: Blob;
  width?: number;
  height?: number;
  error?: string;
}

export type Theme = 'light' | 'dark';

export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
] as const;

export const SUPPORTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.tiff',
  '.tif',
  '.heic',
  '.heif',
  '.avif',
  '.svg',
  '.ico',
] as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_FILES = 50;
export const DEFAULT_QUALITY = 80;
