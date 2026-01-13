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
  canConvert?: boolean;
  remainingToday?: number;
  isPremium?: boolean;
}

export function DownloadSection({
  totalCount,
  completedCount,
  totalOriginalSize,
  totalConvertedSize,
  isProcessing,
  onProcess,
  onDownloadAll,
  canConvert = true,
  remainingToday = 5,
  isPremium = false,
}: DownloadSectionProps) {
  const pendingCount = totalCount - completedCount;
  const savings = totalConvertedSize > 0
    ? calculateSavings(totalOriginalSize, totalConvertedSize)
    : null;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (totalCount === 0) return null;

  return (
    <div className="card p-5 sm:p-6">
      {/* Progress Stats */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">
            Napredak
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)] font-mono">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="progress-bar h-2 rounded-full">
          <div
            className="progress-bar-fill h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Total Savings */}
      {savings && completedCount > 0 && (
        <div className="mb-5 p-4 rounded-xl border-gradient bg-gradient-to-br from-[var(--success-muted)] to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-[var(--success)] font-medium uppercase tracking-wider mb-1 font-mono">
                Ukupna ušteda
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--success)]">
                {savings.formattedSavedBytes}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-tertiary)] font-mono">
                {formatBytes(totalOriginalSize)} → {formatBytes(totalConvertedSize)}
              </p>
              <p className={`text-xl font-bold font-mono ${savings.savedPercentage > 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                {savings.savedPercentage > 0 ? `−${savings.savedPercentage}%` : `+${Math.abs(savings.savedPercentage)}%`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Warning */}
      {!isPremium && pendingCount > remainingToday && remainingToday > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-[var(--warning)]">
              Imate {remainingToday} od 5 besplatnih konverzija. Samo prvih {remainingToday} slika će biti konvertovano.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {pendingCount > 0 && (
          <button
            onClick={onProcess}
            disabled={isProcessing || (!canConvert && !isPremium)}
            className={`
              btn w-full py-4 rounded-xl font-semibold
              ${isProcessing
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-wait'
                : !canConvert && !isPremium
                  ? 'bg-[var(--error-muted)] text-[var(--error)] border border-[var(--error)]/20 cursor-not-allowed'
                  : 'btn-primary'
              }
            `}
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Procesiranje...</span>
              </>
            ) : !canConvert && !isPremium ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Dnevni limit dostignut</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Konvertuj</span>
                <span className="badge bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]">
                  {pendingCount}
                </span>
              </>
            )}
          </button>
        )}

        {completedCount > 0 && (
          <button
            onClick={onDownloadAll}
            disabled={isProcessing}
            className={`
              btn w-full py-4 rounded-xl font-semibold
              ${isProcessing
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'btn-secondary hover:bg-[var(--success)] hover:text-white'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Preuzmi sve</span>
            <span className="badge bg-[var(--text-primary)]/10 text-[var(--text-secondary)]">
              ZIP
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
