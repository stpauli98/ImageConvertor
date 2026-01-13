'use client';

import { formatBytes, calculateSavings } from '@/utils/formatBytes';

interface DownloadSectionProps {
  totalCount: number;
  completedCount: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
  isProcessing: boolean;
  onProcess: () => void;
  onDownloadAll: () => void;
}

export function DownloadSection({
  totalCount,
  completedCount,
  totalOriginalSize,
  totalConvertedSize,
  isProcessing,
  onProcess,
  onDownloadAll,
}: DownloadSectionProps) {
  const pendingCount = totalCount - completedCount;
  const savings = totalConvertedSize > 0
    ? calculateSavings(totalOriginalSize, totalConvertedSize)
    : null;

  if (totalCount === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Progress Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Napredak
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Total Savings */}
      {savings && completedCount > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                UKUPNA UŠTEDA
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {savings.formattedSavedBytes}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(totalOriginalSize)} → {formatBytes(totalConvertedSize)}
              </p>
              <p className={`text-lg font-semibold ${savings.savedPercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                {savings.savedPercentage > 0 ? `-${savings.savedPercentage}%` : `+${Math.abs(savings.savedPercentage)}%`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {pendingCount > 0 && (
          <button
            onClick={onProcess}
            disabled={isProcessing}
            className={`
              flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white
              transition-all duration-200
              ${isProcessing
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            `}
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesiranje...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Konvertuj ({pendingCount})
              </>
            )}
          </button>
        )}

        {completedCount > 0 && (
          <button
            onClick={onDownloadAll}
            disabled={isProcessing}
            className={`
              flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold
              transition-all duration-200
              ${isProcessing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:shadow-green-500/25 active:scale-[0.98]'
              }
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            `}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Preuzmi sve (ZIP)
          </button>
        )}
      </div>
    </div>
  );
}
