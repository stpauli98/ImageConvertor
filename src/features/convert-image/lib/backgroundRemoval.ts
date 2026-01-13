/**
 * Background removal utility using @imgly/background-removal
 * Runs entirely in the browser using ONNX Runtime
 * Includes edge refinement for better quality results
 */

import { BackgroundRemovalQuality, BG_REMOVAL_QUALITIES } from '@/shared/types';

export interface BackgroundRemovalProgress {
  stage: 'downloading' | 'processing' | 'refining';
  progress: number;
}

export interface BackgroundRemovalOptions {
  quality?: BackgroundRemovalQuality;
  refineEdges?: boolean;
  edgeBlur?: number; // 0-5, default 1
  onProgress?: (progress: BackgroundRemovalProgress) => void;
}

/**
 * Apply edge refinement to improve mask quality
 * Smooths alpha channel edges to reduce jagged artifacts
 */
async function refineEdges(
  imageBlob: Blob,
  blurRadius: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply alpha channel smoothing (box blur on alpha only)
      if (blurRadius > 0) {
        const radius = Math.ceil(blurRadius);
        const alphaChannel = new Float32Array(canvas.width * canvas.height);

        // Extract alpha channel
        for (let i = 0; i < data.length; i += 4) {
          alphaChannel[i / 4] = data[i + 3];
        }

        // Apply box blur to alpha
        const blurredAlpha = boxBlurAlpha(alphaChannel, canvas.width, canvas.height, radius);

        // Apply edge-aware refinement
        for (let i = 0; i < data.length; i += 4) {
          const idx = i / 4;
          const originalAlpha = data[i + 3];
          const blurredValue = blurredAlpha[idx];

          // Edge detection: if alpha is between 10 and 245, it's an edge pixel
          if (originalAlpha > 10 && originalAlpha < 245) {
            // Smooth the edge with weighted blend
            const weight = 0.6;
            data[i + 3] = Math.round(originalAlpha * (1 - weight) + blurredValue * weight);
          }

          // Clean up near-transparent pixels (reduce halo)
          if (data[i + 3] < 20) {
            data[i + 3] = 0;
          }

          // Apply slight feathering to semi-transparent edges
          if (data[i + 3] > 0 && data[i + 3] < 255) {
            // Strengthen confident predictions
            if (data[i + 3] > 200) {
              data[i + 3] = Math.min(255, data[i + 3] + 20);
            } else if (data[i + 3] < 50) {
              data[i + 3] = Math.max(0, data[i + 3] - 20);
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create refined image'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for refinement'));
    };

    img.src = url;
  });
}

/**
 * Box blur for alpha channel
 */
function boxBlurAlpha(
  alpha: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const output = new Float32Array(alpha.length);

  // Horizontal pass
  const temp = new Float32Array(alpha.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          sum += alpha[y * width + nx];
          count++;
        }
      }
      temp[y * width + x] = sum / count;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          sum += temp[ny * width + x];
          count++;
        }
      }
      output[y * width + x] = sum / count;
    }
  }

  return output;
}

/**
 * Check if WebGPU is available for acceleration
 */
async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

/**
 * Remove background from an image blob
 * @param imageBlob - The input image as a Blob
 * @param options - Quality, refinement and progress options
 * @returns Promise<Blob> - The image with transparent background
 */
export async function removeImageBackground(
  imageBlob: Blob,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> {
  const {
    quality = 'balanced',
    refineEdges: shouldRefine = true,
    edgeBlur = 1,
    onProgress
  } = options;

  // Get model name based on quality setting
  const qualityOption = BG_REMOVAL_QUALITIES.find(q => q.value === quality);
  const modelName = qualityOption?.model || 'isnet_fp16';

  // Check for WebGPU availability
  const useGPU = await isWebGPUAvailable();

  // Dynamic import to avoid loading the large library until needed
  const { removeBackground } = await import('@imgly/background-removal');

  const result = await removeBackground(imageBlob, {
    model: modelName as 'isnet_quint8' | 'isnet_fp16' | 'isnet',
    device: useGPU ? 'gpu' : 'cpu',
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key: string, current: number, total: number) => {
      // Reserve 0-90% for AI processing, 90-100% for refinement
      const baseProgress = Math.round((current / total) * (shouldRefine ? 90 : 100));

      const stage: 'downloading' | 'processing' =
        key.includes('fetch') || key.includes('download')
          ? 'downloading'
          : 'processing';

      onProgress?.({ stage, progress: baseProgress });
    },
  });

  // Apply edge refinement if enabled
  if (shouldRefine && edgeBlur > 0) {
    onProgress?.({ stage: 'refining', progress: 92 });

    try {
      const refinedResult = await refineEdges(result, edgeBlur);
      onProgress?.({ stage: 'refining', progress: 100 });
      return refinedResult;
    } catch (error) {
      console.warn('Edge refinement failed, returning unrefined result:', error);
      return result;
    }
  }

  return result;
}

/**
 * Simple color-based background removal for logos and graphics
 * Works better than AI for solid color backgrounds
 */
export async function removeColorBackground(
  imageBlob: Blob,
  options: {
    targetColor?: { r: number; g: number; b: number };
    tolerance?: number; // 0-100, how much color variation to remove
    feather?: number; // 0-10, edge softness
  } = {}
): Promise<Blob> {
  const {
    targetColor = { r: 255, g: 255, b: 255 }, // Default: white
    tolerance = 20,
    feather = 2
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate color distance and apply transparency
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate color distance from target
        const distance = Math.sqrt(
          Math.pow(r - targetColor.r, 2) +
          Math.pow(g - targetColor.g, 2) +
          Math.pow(b - targetColor.b, 2)
        );

        // Max possible distance is ~441.67 (sqrt(255^2 * 3))
        const normalizedTolerance = (tolerance / 100) * 441.67;

        if (distance <= normalizedTolerance) {
          // Within tolerance - make transparent
          if (feather > 0 && distance > normalizedTolerance * 0.5) {
            // Feather zone - gradual transparency
            const featherFactor = (distance - normalizedTolerance * 0.5) / (normalizedTolerance * 0.5);
            data[i + 3] = Math.round(255 * featherFactor);
          } else {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image'));
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Detect the dominant background color of an image
 * Samples corners to identify the background
 */
export async function detectBackgroundColor(
  imageBlob: Blob
): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample corners (10x10 pixels each)
      const sampleSize = 10;
      const corners = [
        { x: 0, y: 0 },
        { x: img.width - sampleSize, y: 0 },
        { x: 0, y: img.height - sampleSize },
        { x: img.width - sampleSize, y: img.height - sampleSize },
      ];

      const colors: { r: number; g: number; b: number }[] = [];

      for (const corner of corners) {
        const imageData = ctx.getImageData(corner.x, corner.y, sampleSize, sampleSize);
        const data = imageData.data;

        let rSum = 0, gSum = 0, bSum = 0;
        const pixelCount = sampleSize * sampleSize;

        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
        }

        colors.push({
          r: Math.round(rSum / pixelCount),
          g: Math.round(gSum / pixelCount),
          b: Math.round(bSum / pixelCount),
        });
      }

      // Check if corners are similar (likely same background)
      const avgR = colors.reduce((s, c) => s + c.r, 0) / 4;
      const avgG = colors.reduce((s, c) => s + c.g, 0) / 4;
      const avgB = colors.reduce((s, c) => s + c.b, 0) / 4;

      // Check variance
      const variance = colors.reduce((sum, c) => {
        return sum + Math.abs(c.r - avgR) + Math.abs(c.g - avgG) + Math.abs(c.b - avgB);
      }, 0) / 4;

      // If variance is low, we found a consistent background
      if (variance < 30) {
        resolve({
          r: Math.round(avgR),
          g: Math.round(avgG),
          b: Math.round(avgB),
        });
      } else {
        resolve(null); // No consistent background detected
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Check if background removal is available (SharedArrayBuffer support)
 */
export function isBackgroundRemovalAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // SharedArrayBuffer is required for @imgly/background-removal
    return typeof SharedArrayBuffer !== 'undefined';
  } catch {
    return false;
  }
}
