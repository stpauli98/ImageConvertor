'use client';

import { useState, useCallback, useRef } from 'react';
import { SUPPORTED_EXTENSIONS } from '@/shared/types';

interface DropZoneProps {
  onFilesAdded: (files: FileList | File[]) => Promise<{ error?: string }>;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (!disabled && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
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
          relative overflow-hidden rounded-2xl cursor-pointer
          transition-all duration-300 ease-out
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : isDragging
              ? 'scale-[1.01]'
              : 'hover:scale-[1.005]'
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
        {/* Background with border */}
        <div className={`
          absolute inset-0 rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
            : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]'
          }
        `} />

        {/* Animated glow on drag */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-glow opacity-50" />
        )}

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

        {/* Content */}
        <div className={`
          relative z-10 flex flex-col items-center justify-center
          px-6 py-12 sm:py-16 md:py-20
          transition-transform duration-300
          ${isDragging ? 'scale-105' : ''}
        `}>
          {/* Icon */}
          <div className={`
            relative mb-6 transition-all duration-300
            ${isDragging ? 'animate-float' : ''}
          `}>
            <div className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center
              transition-all duration-300
              ${isDragging
                ? 'bg-[var(--accent)] shadow-lg'
                : 'bg-[var(--bg-tertiary)]'
              }
            `}>
              {isDragging ? (
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-inverse)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--text-tertiary)]"
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

            {/* Decorative ring */}
            {isDragging && (
              <div className="absolute -inset-2 rounded-2xl border-2 border-[var(--accent)] opacity-30 animate-ping" />
            )}
          </div>

          {/* Text */}
          <h3 className={`
            text-lg sm:text-xl font-semibold mb-2 text-center transition-colors duration-300
            ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}
          `}>
            {isDragging ? 'Pustite slike ovdje' : 'Prevucite slike ovdje'}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] mb-6 text-center">
            ili kliknite za odabir fajlova
          </p>

          {/* CTA Button */}
          <button
            type="button"
            className={`
              btn btn-primary text-sm sm:text-base
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Odaberi slike
          </button>

          {/* Format info */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              JPG
            </span>
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              PNG
            </span>
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              HEIC
            </span>
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              GIF
            </span>
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              +5
            </span>
          </div>

          <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center font-mono">
            Max 50 slika • Max 25MB po slici
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--error-muted)] border border-[var(--error)]/20 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--error)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-[var(--error)] whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
