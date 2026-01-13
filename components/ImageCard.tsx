'use client';

import { ImageFile } from '@/types';
import { formatBytes, calculateSavings } from '@/utils/formatBytes';
import { truncateFileName } from '@/utils/imageUtils';

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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
            Na čekanju
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesiranje
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Završeno
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Greška
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          {image.thumbnail ? (
            <img
              src={image.thumbnail}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={image.name}>
                {truncateFileName(image.name)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {formatBytes(image.originalSize)}
                {image.originalWidth && image.originalHeight && (
                  <> • {image.originalWidth}×{image.originalHeight}px</>
                )}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Progress Bar */}
          {image.status === 'processing' && (
            <div className="mb-2">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${image.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{image.progress}%</p>
            </div>
          )}

          {/* Completed Info */}
          {image.status === 'completed' && savings && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {formatBytes(image.convertedSize!)}
                </span>
                {image.newWidth && image.newHeight && (
                  <span className="ml-1">• {image.newWidth}×{image.newHeight}px</span>
                )}
              </div>
              <div className={`font-medium ${savings.savedPercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                {savings.savedPercentage > 0 ? (
                  <>Ušteđeno: {savings.formattedSavedBytes} ({savings.savedPercentage}%)</>
                ) : (
                  <>Povećano: {savings.formattedSavedBytes}</>
                )}
              </div>
            </div>
          )}

          {/* Error Info */}
          {image.status === 'error' && image.error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{image.error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {image.status === 'error' && (
            <button
              onClick={() => onRetry(image.id)}
              className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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
              className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
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
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
