'use client';

import { ImageFile } from '../model/types';
import { formatBytes, calculateSavings } from '@/shared/lib/formatBytes';
import { truncateFileName } from '@/shared/lib/string';

interface ImageCardProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ImageCard({ image, onRemove, onRetry, onDownload }: ImageCardProps) {
  const savings = image.convertedSize !== null
    ? calculateSavings(image.originalSize, image.convertedSize)
    : null;

  const getStatusBadge = () => {
    switch (image.status) {
      case 'pending':
        return (
          <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            ČEKA
          </span>
        );
      case 'processing':
        return (
          <span className="badge bg-[var(--accent-muted)] text-[var(--accent)]">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            PROCESIRA
          </span>
        );
      case 'completed':
        return (
          <span className="badge bg-[var(--success-muted)] text-[var(--success)]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            GOTOVO
          </span>
        );
      case 'error':
        return (
          <span className="badge bg-[var(--error-muted)] text-[var(--error)]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            GREŠKA
          </span>
        );
    }
  };

  return (
    <div className={`
      card p-3 sm:p-4 animate-slide-up
      ${image.status === 'completed' ? 'hover:border-[var(--success)]/30' : ''}
      ${image.status === 'error' ? 'border-[var(--error)]/30' : ''}
    `}>
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] relative">
          {image.thumbnail ? (
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Processing overlay */}
          {image.status === 'processing' && (
            <div className="absolute inset-0 bg-[var(--bg-primary)]/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate" title={image.name}>
                {truncateFileName(image.name, 20)}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                {formatBytes(image.originalSize)}
                {image.originalWidth && image.originalHeight && (
                  <span className="hidden sm:inline"> • {image.originalWidth}×{image.originalHeight}</span>
                )}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Progress Bar */}
          {image.status === 'processing' && (
            <div className="mt-2">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill transition-all duration-300 ease-out"
                  style={{ width: `${image.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-[var(--text-tertiary)] font-mono">{image.progress}%</p>
                {image.estimatedTimeRemaining !== null && image.estimatedTimeRemaining > 0 && (
                  <p className="text-[10px] text-[var(--accent)] font-mono">
                    ~{image.estimatedTimeRemaining < 60
                      ? `${image.estimatedTimeRemaining}s`
                      : `${Math.floor(image.estimatedTimeRemaining / 60)}m ${image.estimatedTimeRemaining % 60}s`
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Completed Info */}
          {image.status === 'completed' && savings && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                → {formatBytes(image.convertedSize!)}
                {image.newWidth && image.newHeight && (
                  <span className="hidden sm:inline"> • {image.newWidth}×{image.newHeight}</span>
                )}
              </span>
              <span className={`
                text-xs font-semibold font-mono
                ${savings.savedPercentage > 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}
              `}>
                {savings.savedPercentage > 0 ? (
                  <>−{savings.savedPercentage}%</>
                ) : (
                  <>+{Math.abs(savings.savedPercentage)}%</>
                )}
              </span>
            </div>
          )}

          {/* Error Info */}
          {image.status === 'error' && image.error && (
            <p className="mt-2 text-xs text-[var(--error)]">{image.error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {image.status === 'error' && (
            <button
              onClick={() => onRetry(image.id)}
              className="btn-icon w-9 h-9 sm:w-10 sm:h-10 hover:text-[var(--accent)] hover:border-[var(--accent)]/30"
              title="Pokušaj ponovo"
              aria-label="Retry conversion"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {image.status === 'completed' && (
            <button
              onClick={() => onDownload(image.id)}
              className="btn-icon w-9 h-9 sm:w-10 sm:h-10 hover:text-[var(--success)] hover:border-[var(--success)]/30"
              title="Preuzmi"
              aria-label="Download converted image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onRemove(image.id)}
            className="btn-icon w-9 h-9 sm:w-10 sm:h-10 hover:text-[var(--error)] hover:border-[var(--error)]/30"
            title="Ukloni"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
