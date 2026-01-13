'use client';

import { useState, useCallback, useRef } from 'react';
import { SUPPORTED_EXTENSIONS } from '@/types';

interface DropZoneProps {
  onFilesAdded: (files: FileList | File[]) => Promise<{ error?: string }>;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const result = await onFilesAdded(files);
      if (result.error) {
        setError(result.error);
      }
    }
  }, [disabled, onFilesAdded]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const result = await onFilesAdded(files);
      if (result.error) {
        setError(result.error);
      }
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onFilesAdded]);

  const acceptFormats = SUPPORTED_EXTENSIONS.join(',');

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${disabled
            ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
            : isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-lg shadow-blue-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          }
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Drop zone for uploading images"
        aria-disabled={disabled}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptFormats}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          aria-hidden="true"
        />

        <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <div className="mx-auto w-16 h-16 mb-4">
            {isDragging ? (
              <svg
                className="w-full h-full text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
                />
              </svg>
            ) : (
              <svg
                className="w-full h-full text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
            {isDragging ? 'Pustite slike ovdje' : 'Prevucite slike ovdje'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            ili kliknite za odabir
          </p>

          <button
            type="button"
            className={`
              inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm
              transition-colors duration-200
              ${disabled
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
              }
            `}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Browse files
          </button>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            JPG, PNG, GIF, BMP, TIFF, HEIC, AVIF, SVG, ICO • Max 50 slika • Max 25MB po slici
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
