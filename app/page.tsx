'use client';

import { useState, useCallback } from 'react';
import { ThemeToggle, DropZone, ImageList, ControlPanel, DownloadSection, UpgradeModal, UsageBadge } from '@/components';
import { useImageConverter } from '@/hooks/useImageConverter';
import { useUsageTracking } from '@/hooks/useUsageTracking';

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const {
    remainingToday,
    isPremium,
    canConvert,
    isLoaded,
    recordConversion,
    checkCanConvert,
    activatePremium,
    dailyLimit,
  } = useUsageTracking();

  // Wrapper for processImages that checks usage limits
  const handleProcessImages = useCallback(async () => {
    const pendingCount = images.filter(img => img.status === 'pending').length;

    if (!checkCanConvert(pendingCount)) {
      setShowUpgradeModal(true);
      return;
    }

    // Record the conversions
    recordConversion(pendingCount);

    // Process the images
    await processImages();
  }, [images, checkCanConvert, recordConversion, processImages]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/25">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--bg-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight font-display">
                  WEBP<span className="text-[var(--accent)]">.</span>CONVERT
                </h1>
                <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)] hidden sm:block font-mono uppercase tracking-wider">
                  Bulk Image Optimizer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoaded && (
                <UsageBadge
                  remainingToday={remainingToday}
                  dailyLimit={dailyLimit}
                  isPremium={isPremium}
                  onClick={() => setShowUpgradeModal(true)}
                />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 font-display">
            Konvertujte slike u{' '}
            <span className="text-[var(--accent)] relative">
              WebP
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--accent)]/30 rounded-full" />
            </span>{' '}
            format
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Potpuno besplatna konverzija u browseru.{' '}
            <span className="text-[var(--text-primary)] font-medium">
              Vaše slike nikada ne napuštaju vaš uređaj.
            </span>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--text-primary)] text-sm">Kompresija</p>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">Uštedite do 70%</p>
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
                onProcess={handleProcessImages}
                onDownloadAll={downloadAll}
                canConvert={canConvert}
                remainingToday={remainingToday}
                isPremium={isPremium}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-[var(--text-tertiary)]">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Sve slike se procesiraju lokalno u vašem browseru</span>
            </p>
            <p className="font-mono">
              WEBP.CONVERT © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onActivate={activatePremium}
        remainingToday={remainingToday}
        dailyLimit={dailyLimit}
      />
    </div>
  );
}
