// Hook
export { useImageConverter } from './model/useImageConverter';

// Utilities
export {
  generateId,
  validateFile,
  convertImage,
  createThumbnail,
  downloadBlob,
  downloadAllAsZip,
  getOutputFileName,
  estimateSavings,
  loadImage,
  calculateNewDimensions,
  isFormatSupported,
  getEffectiveFormat,
} from './lib/imageUtils';

// Background Removal
export {
  removeImageBackground,
  removeColorBackground,
  detectBackgroundColor,
  isBackgroundRemovalAvailable,
} from './lib/backgroundRemoval';

export type {
  BackgroundRemovalProgress,
  BackgroundRemovalOptions,
} from './lib/backgroundRemoval';
