'use client';

import { useImageConverter } from '@/features/convert-image';
import { DropZone } from '@/features/upload-image';
import { ControlPanel } from '@/features/settings-panel';
import { DownloadSection } from '@/features/download';
import { ImageList } from '@/entities/image';

export function ImageConverterWidget() {
  const {
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
  } = useImageConverter();

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 font-display">
          Konvertujte i{' '}
          <span className="text-[var(--accent)] relative">
            optimizirajte
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--accent)]/30 rounded-full" />
          </span>{' '}
          slike
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Potpuno besplatna konverzija u browseru.{' '}
          <span className="text-[var(--text-primary)] font-medium">
            Vaše slike nikada ne napuštaju vaš uređaj.
          </span>
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-4 flex items-center gap-3 group hover:border-[var(--success)]/30 transition-colors">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--success-muted)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] text-sm">100% Privatno</p>
            <p className="text-xs text-[var(--text-tertiary)] font-mono">Lokalno procesiranje</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3 group hover:border-[var(--accent)]/30 transition-colors">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] text-sm">Brza konverzija</p>
            <p className="text-xs text-[var(--text-tertiary)] font-mono">Do 50 slika odjednom</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3 group hover:border-[var(--warning)]/30 transition-colors">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--warning-muted)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] text-sm">Više formata</p>
            <p className="text-xs text-[var(--text-tertiary)] font-mono">WebP, PNG, JPEG, AVIF</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3 group hover:border-purple-500/30 transition-colors">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--text-primary)] text-sm">AI Background</p>
            <p className="text-xs text-[var(--text-tertiary)] font-mono">Uklonite pozadinu</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="mb-6 sm:mb-8">
        <DropZone onFilesAdded={addFiles} disabled={isProcessing} />
      </div>

      {/* Main Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
          {/* Image List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ImageList
              images={images}
              onRemove={removeImage}
              onRetry={retryImage}
              onDownload={downloadImage}
              onClearAll={clearAll}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <ControlPanel
              settings={settings}
              onSettingsChange={updateSettings}
              totalOriginalSize={totalOriginalSize}
              hasImages={images.length > 0}
            />
            <DownloadSection
              totalCount={images.length}
              completedCount={completedCount}
              totalOriginalSize={totalOriginalSize}
              totalConvertedSize={totalConvertedSize}
              isProcessing={isProcessing}
              onProcess={processImages}
              onDownloadAll={downloadAll}
            />
          </div>
        </div>
      )}

      {/* Empty State Info */}
      {images.length === 0 && (
        <div className="mt-6 sm:mt-8 text-center animate-fade-in">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              <span className="font-mono">JPG, PNG, GIF, HEIC, AVIF...</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">|</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono">Max 25MB / slika</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">|</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
              <span className="font-mono">Do 50 slika</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
