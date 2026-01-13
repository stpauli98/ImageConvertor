import {
  ConversionSettings,
  SUPPORTED_FORMATS,
  SUPPORTED_EXTENSIONS,
  OUTPUT_FORMATS,
  OutputFormat,
} from '@/shared/types';
import { MAX_FILE_SIZE } from '@/shared/config/constants';
import {
  removeImageBackground,
  removeColorBackground,
  detectBackgroundColor,
  isBackgroundRemovalAvailable,
} from './backgroundRemoval';

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

export function getOutputFileName(originalName: string, format: OutputFormat = 'webp'): string {
  const baseName = originalName.slice(0, originalName.lastIndexOf('.'));
  const formatInfo = OUTPUT_FORMATS.find(f => f.value === format);
  const extension = formatInfo?.extension || '.webp';
  return `${baseName}${extension}`;
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

// Check if browser supports a specific format
export function isFormatSupported(format: OutputFormat): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const formatInfo = OUTPUT_FORMATS.find(f => f.value === format);
  if (!formatInfo) return false;

  const dataUrl = canvas.toDataURL(formatInfo.mime);
  return dataUrl.startsWith(`data:${formatInfo.mime}`);
}

// Get effective format (with fallback for unsupported formats)
export function getEffectiveFormat(requestedFormat: OutputFormat): OutputFormat {
  if (isFormatSupported(requestedFormat)) {
    return requestedFormat;
  }
  // Fallback to WebP, then PNG
  if (requestedFormat === 'avif' && isFormatSupported('webp')) {
    console.warn('AVIF nije podržan u ovom browseru, koristim WebP');
    return 'webp';
  }
  return 'png';
}

export async function convertImage(
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
  // Progress tracking with smooth increments
  let currentProgress = 0;
  const updateProgress = (target: number) => {
    if (target > currentProgress) {
      currentProgress = target;
      onProgress?.(currentProgress);
    }
  };

  // Determine progress ranges based on enabled features
  const hasBgRemoval = settings.removeBackground && isBackgroundRemovalAvailable();
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  // Progress allocation:
  // - HEIC: 0-10 (if needed)
  // - BG Removal: 10-70 (if enabled) or skip
  // - Load image: next 10%
  // - Resize: next 5%
  // - Canvas draw: next 5%
  // - Export: final 10%

  const progressRanges = {
    heicStart: 0,
    heicEnd: isHeic ? 10 : 0,
    bgStart: isHeic ? 10 : 0,
    bgEnd: hasBgRemoval ? 70 : (isHeic ? 10 : 0),
    loadStart: hasBgRemoval ? 70 : (isHeic ? 10 : 0),
    loadEnd: hasBgRemoval ? 80 : (isHeic ? 40 : 30),
    resizeEnd: hasBgRemoval ? 85 : (isHeic ? 60 : 50),
    canvasEnd: hasBgRemoval ? 90 : (isHeic ? 80 : 70),
    exportEnd: 100,
  };

  updateProgress(2);

  // Handle HEIC conversion
  let processedFile = file;
  if (isHeic) {
    updateProgress(5);
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
    updateProgress(progressRanges.heicEnd);
  }

  // Handle background removal if enabled
  if (hasBgRemoval) {
    try {
      updateProgress(progressRanges.bgStart + 2);

      let bgRemovedBlob: Blob;

      if (settings.bgRemovalMode === 'color') {
        // Color-based removal for logos/graphics
        updateProgress(progressRanges.bgStart + 5);

        // Try to detect background color automatically
        const detectedColor = await detectBackgroundColor(processedFile);
        const targetColor = detectedColor || { r: 255, g: 255, b: 255 }; // Default to white

        bgRemovedBlob = await removeColorBackground(processedFile, {
          targetColor,
          tolerance: settings.bgColorTolerance,
          feather: 2,
        });

        updateProgress(progressRanges.bgEnd);
      } else {
        // AI-based removal for photos
        bgRemovedBlob = await removeImageBackground(processedFile, {
          quality: settings.bgRemovalQuality,
          refineEdges: settings.refineEdges,
          edgeBlur: settings.edgeBlur,
          onProgress: ({ progress }) => {
            // Map BG removal progress (0-100) to our allocated range
            const mappedProgress = progressRanges.bgStart +
              Math.round((progress / 100) * (progressRanges.bgEnd - progressRanges.bgStart));
            updateProgress(mappedProgress);
          },
        });
      }

      processedFile = new File(
        [bgRemovedBlob],
        processedFile.name,
        { type: 'image/png' }
      );
    } catch (error) {
      console.error('Background removal failed:', error);
      // Continue without background removal
    }
  }

  updateProgress(progressRanges.loadStart);

  const img = await loadImage(processedFile);
  const originalWidth = img.width;
  const originalHeight = img.height;

  updateProgress(progressRanges.loadEnd);

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (settings.enableResize && (settings.maxWidth > 0 || settings.maxHeight > 0)) {
    const maxW = settings.maxWidth || originalWidth;
    const maxH = settings.maxHeight || originalHeight;
    const dimensions = calculateNewDimensions(originalWidth, originalHeight, maxW, maxH);
    targetWidth = dimensions.width;
    targetHeight = dimensions.height;
  }

  updateProgress(progressRanges.resizeEnd);

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

  updateProgress(progressRanges.canvasEnd);

  // Determine effective format (with fallback)
  const effectiveFormat = getEffectiveFormat(settings.outputFormat);
  const formatInfo = OUTPUT_FORMATS.find(f => f.value === effectiveFormat);
  const mimeType = formatInfo?.mime || 'image/webp';

  // Quality only applies to lossy formats
  const quality = ['jpeg', 'webp', 'avif'].includes(effectiveFormat)
    ? settings.quality / 100
    : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          updateProgress(100);
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
      mimeType,
      quality
    );
  });
}

// Legacy alias for backward compatibility
export const convertToWebP = convertImage;

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
  images: Array<{ name: string; blob: Blob }>,
  format: OutputFormat = 'webp'
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  images.forEach(({ name, blob }) => {
    const outputName = getOutputFileName(name, format);
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
