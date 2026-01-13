'use client';

import { useState, useCallback, useRef } from 'react';
import { ImageFile, ConversionSettings, DEFAULT_QUALITY, MAX_FILES } from '@/types';
import {
  generateId,
  validateFile,
  convertToWebP,
  createThumbnail,
  downloadBlob,
  downloadAllAsZip,
  getOutputFileName,
} from '@/utils/imageUtils';

export function useImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: DEFAULT_QUALITY,
    enableResize: false,
    maxWidth: 1920,
    maxHeight: 1080,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const abortRef = useRef(false);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = images.length;
    const availableSlots = MAX_FILES - currentCount;

    if (availableSlots <= 0) {
      return {
        error: `Možete uploadati maksimalno ${MAX_FILES} slika odjednom`,
      };
    }

    const filesToAdd = fileArray.slice(0, availableSlots);
    const errors: string[] = [];

    if (fileArray.length > availableSlots) {
      errors.push(`Samo prvih ${availableSlots} slika je dodano. Maksimalno ${MAX_FILES} slika.`);
    }

    const newImages: ImageFile[] = [];

    for (const file of filesToAdd) {
      const validation = validateFile(file);

      if (!validation.valid) {
        errors.push(validation.error || 'Nepoznata greška');
        continue;
      }

      const id = generateId();
      const thumbnail = await createThumbnail(file).catch(() => null);

      newImages.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        convertedSize: null,
        originalWidth: null,
        originalHeight: null,
        newWidth: null,
        newHeight: null,
        status: 'pending',
        progress: 0,
        error: null,
        convertedBlob: null,
        thumbnail,
      });
    }

    setImages((prev) => [...prev, ...newImages]);

    return errors.length > 0 ? { error: errors.join('\n') } : {};
  }, [images.length]);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    abortRef.current = true;
    setImages([]);
    setIsProcessing(false);
    processingRef.current = false;
    setTimeout(() => {
      abortRef.current = false;
    }, 100);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ConversionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const processImages = useCallback(async () => {
    if (processingRef.current) return;

    const pendingImages = images.filter((img) => img.status === 'pending' || img.status === 'error');
    if (pendingImages.length === 0) return;

    processingRef.current = true;
    setIsProcessing(true);
    abortRef.current = false;

    for (const image of pendingImages) {
      if (abortRef.current) break;

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: 'processing', progress: 0, error: null } : img
        )
      );

      try {
        const result = await convertToWebP(image.file, settings, (progress) => {
          if (abortRef.current) return;
          setImages((prev) =>
            prev.map((img) => (img.id === image.id ? { ...img, progress } : img))
          );
        });

        if (abortRef.current) break;

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'completed',
                  progress: 100,
                  convertedSize: result.blob.size,
                  convertedBlob: result.blob,
                  originalWidth: result.originalWidth,
                  originalHeight: result.originalHeight,
                  newWidth: result.width,
                  newHeight: result.height,
                }
              : img
          )
        );
      } catch (err) {
        if (abortRef.current) break;

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error',
                  progress: 0,
                  error: err instanceof Error ? err.message : 'Konverzija nije uspjela',
                }
              : img
          )
        );
      }
    }

    processingRef.current = false;
    setIsProcessing(false);
  }, [images, settings]);

  const retryImage = useCallback(async (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, status: 'pending', progress: 0, error: null } : img
      )
    );
  }, []);

  const downloadImage = useCallback((id: string) => {
    const image = images.find((img) => img.id === id);
    if (image?.convertedBlob) {
      downloadBlob(image.convertedBlob, getOutputFileName(image.name));
    }
  }, [images]);

  const downloadAll = useCallback(async () => {
    const completedImages = images.filter(
      (img) => img.status === 'completed' && img.convertedBlob
    );

    if (completedImages.length === 0) return;

    const imagesToDownload = completedImages.map((img) => ({
      name: img.name,
      blob: img.convertedBlob!,
    }));

    await downloadAllAsZip(imagesToDownload);
  }, [images]);

  const completedCount = images.filter((img) => img.status === 'completed').length;
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalConvertedSize = images
    .filter((img) => img.convertedSize !== null)
    .reduce((sum, img) => sum + (img.convertedSize || 0), 0);

  return {
    images,
    settings,
    isProcessing,
    completedCount,
    totalOriginalSize,
    totalConvertedSize,
    addFiles,
    removeImage,
    clearAll,
    updateSettings,
    processImages,
    retryImage,
    downloadImage,
    downloadAll,
  };
}
