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
  processingStartTime: number | null;
  estimatedTimeRemaining: number | null;
}
