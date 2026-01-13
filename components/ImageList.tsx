'use client';

import { ImageFile } from '@/types';
import { ImageCard } from './ImageCard';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDownload: (id: string) => void;
  onClearAll: () => void;
}

export function ImageList({
  images,
  onRemove,
  onRetry,
  onDownload,
  onClearAll,
}: ImageListProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Slike ({images.length})
        </h2>
        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Obriši sve
        </button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 -mr-2">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onRemove={onRemove}
            onRetry={onRetry}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
