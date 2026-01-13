'use client';

import { ImageFile } from '../model/types';
import { ImageCard } from './ImageCard';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';

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
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  if (images.length === 0) return null;

  const handleClearAll = () => {
    showConfirm({
      title: 'Obriši sve slike?',
      message: `Ovo će ukloniti svih ${images.length} slika iz liste. Ova akcija se ne može poništiti.`,
      confirmText: 'Da, obriši sve',
      cancelText: 'Odustani',
      variant: 'danger',
      onConfirm: onClearAll,
    });
  };

  return (
    <>
      {ConfirmDialogComponent}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Slike
            <span className="badge bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
              {images.length}
            </span>
          </h2>
          <button
            onClick={handleClearAll}
            className="btn btn-ghost text-sm text-[var(--error)] hover:bg-[var(--error-muted)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Obriši sve</span>
          </button>
        </div>

      <div className="space-y-2 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-1 -mr-1">
        {images.map((image, index) => (
          <div
            key={image.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="opacity-0 animate-slide-up"
          >
            <ImageCard
              image={image}
              onRemove={onRemove}
              onRetry={onRetry}
              onDownload={onDownload}
            />
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
