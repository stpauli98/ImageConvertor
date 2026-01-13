'use client';

import { formatBytes, calculateSavings } from '@/shared/lib/formatBytes';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Tooltip } from '@/shared/ui/Tooltip';

interface DownloadSectionProps {
  totalCount: number;
  completedCount: number;
  totalOriginalSize: number;
  totalConvertedSize: number;
  isProcessing: boolean;
  isCancelling: boolean;
  currentProcessingIndex: number;
  totalToProcess: number;
  outputFormat: string;
  quality: number;
  removeBackground: boolean;
  onProcess: () => void;
  onCancel: () => void;
  onDownloadAll: () => void;
}

export function DownloadSection({
  totalCount,
  completedCount,
  totalOriginalSize,
  totalConvertedSize,
  isProcessing,
  isCancelling,
  currentProcessingIndex,
  totalToProcess,
  outputFormat,
  quality,
  removeBackground,
  onProcess,
  onCancel,
  onDownloadAll,
}: DownloadSectionProps) {
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  const pendingCount = totalCount - completedCount;
  const savings = totalConvertedSize > 0
    ? calculateSavings(totalOriginalSize, totalConvertedSize)
    : null;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatLabel = outputFormat.toUpperCase();

  const handleCancel = () => {
    showConfirm({
      title: 'Prekinuti konverziju?',
      message: 'Nedovršene slike neće biti sačuvane. Već konvertirane slike ostaju.',
      confirmText: 'Da, prekini',
      cancelText: 'Nastavi',
      variant: 'warning',
      onConfirm: onCancel,
    });
  };

  if (totalCount === 0) return null;

  return (
    <>
      {ConfirmDialogComponent}
      <div className="card p-5 sm:p-6">
        {/* Progress Stats */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              {isProcessing
                ? `Konvertiram sliku ${currentProcessingIndex} od ${totalToProcess}...`
                : 'Napredak'
              }
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

        {/* Mini Settings Summary */}
        {pendingCount > 0 && !isProcessing && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
            <p className="text-xs text-[var(--text-tertiary)] font-medium mb-1">Postavke konverzije:</p>
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-mono font-medium text-[var(--text-primary)]">{formatLabel}</span>
              <span className="mx-1.5">•</span>
              <span className="font-mono">{quality}%</span> kvaliteta
              {removeBackground && (
                <>
                  <span className="mx-1.5">•</span>
                  <span className="text-[var(--accent)]">Uklanjanje pozadine</span>
                </>
              )}
            </p>
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {pendingCount > 0 && (
            <div className="flex gap-2">
              <Tooltip
                content={`Pretvori ${pendingCount} slika u ${formatLabel} format s kvalitetom ${quality}%`}
                disabled={isProcessing}
              >
                <button
                  onClick={onProcess}
                  disabled={isProcessing}
                  className={`
                    btn flex-1 py-4 rounded-xl font-semibold
                    ${isProcessing
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-wait'
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
                      <span>
                        {isCancelling ? 'Prekidam...' : `Konvertiram ${currentProcessingIndex}/${totalToProcess}...`}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Konvertuj u {formatLabel}</span>
                      <span className="badge bg-[var(--text-inverse)]/20 text-[var(--text-inverse)]">
                        {pendingCount}
                      </span>
                    </>
                  )}
                </button>
              </Tooltip>

              {isProcessing && !isCancelling && (
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost py-4 px-4 rounded-xl text-[var(--error)] hover:bg-[var(--error-muted)]"
                  title="Otkaži konverziju"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
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
    </>
  );
}
