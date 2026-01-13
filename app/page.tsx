'use client';

import { ThemeToggle, DropZone, ImageList, ControlPanel, DownloadSection } from '@/components';
import { useImageConverter } from '@/hooks/useImageConverter';

export default function Home() {
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">WebP Konvertor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Bulk konverzija i optimizacija slika</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Konvertujte slike u WebP format
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Potpuno besplatna konverzija u browseru. Vaše slike nikada ne napuštaju vaš uređaj.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">100% Privatno</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Procesiranje lokalno</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Brza konverzija</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Do 50 slika odjednom</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Kompresija</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uštedite do 70%</p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="mb-8">
          <DropZone onFilesAdded={addFiles} disabled={isProcessing} />
        </div>

        {/* Main Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image List */}
            <div className="lg:col-span-2">
              <ImageList
                images={images}
                onRemove={removeImage}
                onRetry={retryImage}
                onDownload={downloadImage}
                onClearAll={clearAll}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
          <div className="mt-8 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Podržano: JPG, PNG, GIF, HEIC, AVIF...</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Max 25MB po slici</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Do 50 slika</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Sve slike se procesiraju lokalno u vašem browseru.</p>
            <p>WebP Konvertor © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
