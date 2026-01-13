import {
  ConversionSettings,
  SUPPORTED_FORMATS,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '@/types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fajl "${file.name}" prelazi maksimalnu veličinu od 25MB`,
    };
  }

  // Check file type by MIME type
  const mimeValid = SUPPORTED_FORMATS.some((format) =>
    file.type.toLowerCase() === format || file.type.toLowerCase().startsWith(format.split('/')[0] + '/')
  );

  // Check file extension as fallback
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const extensionValid = SUPPORTED_EXTENSIONS.some((ext) => ext === extension);

  if (!mimeValid && !extensionValid) {
    return {
      valid: false,
      error: `Fajl "${file.name}" nije podržan. Podržani formati: JPG, PNG, GIF, BMP, TIFF, HEIC, AVIF, SVG, ICO`,
    };
  }

  return { valid: true };
}

export function truncateFileName(name: string, maxLength = 25): string {
  if (name.length <= maxLength) return name;

  const extension = name.split('.').pop() || '';
  const baseName = name.slice(0, name.lastIndexOf('.'));
  const truncatedBase = baseName.slice(0, maxLength - extension.length - 4);

  return `${truncatedBase}...${extension}`;
}

export function getOutputFileName(originalName: string): string {
  const baseName = originalName.slice(0, originalName.lastIndexOf('.'));
  return `${baseName}.webp`;
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Nije moguće učitati sliku: ${file.name}`));
    };

    img.src = url;
  });
}

export function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Only resize if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
}

export async function convertToWebP(
  file: File,
  settings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}> {
  onProgress?.(10);

  // Handle HEIC conversion
  let processedFile = file;
  if (file.type === 'image/heic' || file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/png',
    });
    processedFile = new File(
      [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
      file.name.replace(/\.(heic|heif)$/i, '.png'),
      { type: 'image/png' }
    );
  }

  onProgress?.(30);

  const img = await loadImage(processedFile);
  const originalWidth = img.width;
  const originalHeight = img.height;

  onProgress?.(50);

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (settings.enableResize && (settings.maxWidth > 0 || settings.maxHeight > 0)) {
    const maxW = settings.maxWidth || originalWidth;
    const maxH = settings.maxHeight || originalHeight;
    const dimensions = calculateNewDimensions(originalWidth, originalHeight, maxW, maxH);
    targetWidth = dimensions.width;
    targetHeight = dimensions.height;
  }

  onProgress?.(70);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Nije moguće kreirati canvas context');
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  onProgress?.(90);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve({
            blob,
            width: targetWidth,
            height: targetHeight,
            originalWidth,
            originalHeight,
          });
        } else {
          reject(new Error('Konverzija nije uspjela'));
        }
      },
      'image/webp',
      settings.quality / 100
    );
  });
}

export async function createThumbnail(file: File, maxSize = 100): Promise<string> {
  let processedFile = file;

  // Handle HEIC for thumbnail
  if (file.type === 'image/heic' || file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.5,
      });
      processedFile = new File(
        [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
        file.name,
        { type: 'image/jpeg' }
      );
    } catch {
      // If HEIC conversion fails, return a placeholder
      return '';
    }
  }

  const img = await loadImage(processedFile);
  const { width, height } = calculateNewDimensions(img.width, img.height, maxSize, maxSize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.7);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(
  images: Array<{ name: string; blob: Blob }>
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  images.forEach(({ name, blob }) => {
    const outputName = getOutputFileName(name);
    zip.file(outputName, blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, 'converted-images.zip');
}

export function estimateSavings(originalSize: number, quality: number): number {
  // Rough estimation based on typical WebP compression ratios
  // Higher quality = less compression = less savings
  const compressionRatio = 0.3 + (quality / 100) * 0.5; // 30-80% of original
  return Math.round(originalSize * (1 - compressionRatio));
}
