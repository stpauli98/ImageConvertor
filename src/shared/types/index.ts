export type Theme = 'light' | 'dark';

export type OutputFormat = 'webp' | 'png' | 'jpeg' | 'avif';

export type BackgroundRemovalQuality = 'fast' | 'balanced' | 'maximum';
export type BackgroundRemovalMode = 'ai' | 'color';

export interface BgRemovalQualityOption {
  value: BackgroundRemovalQuality;
  label: string;
  description: string;
  model: string;
}

export interface BgRemovalModeOption {
  value: BackgroundRemovalMode;
  label: string;
  description: string;
  icon: 'brain' | 'palette';
}

export const BG_REMOVAL_QUALITIES: BgRemovalQualityOption[] = [
  { value: 'fast', label: 'Brzo', description: '42MB model, brže', model: 'isnet_quint8' },
  { value: 'balanced', label: 'Balans', description: '84MB model, preporučeno', model: 'isnet_fp16' },
  { value: 'maximum', label: 'Maksimalno', description: '168MB model, najbolja kvaliteta', model: 'isnet' },
];

export const BG_REMOVAL_MODES: BgRemovalModeOption[] = [
  { value: 'ai', label: 'AI', description: 'Fotografije, kompleksne slike', icon: 'brain' },
  { value: 'color', label: 'Boja', description: 'Logotipi, grafike s jednobojnom pozadinom', icon: 'palette' },
];

export interface OutputFormatOption {
  value: OutputFormat;
  label: string;
  mime: string;
  extension: string;
}

export const OUTPUT_FORMATS: OutputFormatOption[] = [
  { value: 'webp', label: 'WebP', mime: 'image/webp', extension: '.webp' },
  { value: 'png', label: 'PNG', mime: 'image/png', extension: '.png' },
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', extension: '.jpg' },
  { value: 'avif', label: 'AVIF', mime: 'image/avif', extension: '.avif' },
];

export interface ConversionSettings {
  quality: number;
  outputFormat: OutputFormat;
  enableResize: boolean;
  maxWidth: number;
  maxHeight: number;
  stripMetadata: boolean;
  removeBackground: boolean;
  bgRemovalMode: BackgroundRemovalMode;
  bgRemovalQuality: BackgroundRemovalQuality;
  bgColorTolerance: number;
  refineEdges: boolean;
  edgeBlur: number;
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
