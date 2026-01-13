'use client';

import { ConversionSettings } from '@/types';
import { estimateSavings } from '@/utils/imageUtils';
import { formatBytes } from '@/utils/formatBytes';

interface ControlPanelProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: Partial<ConversionSettings>) => void;
  totalOriginalSize: number;
  hasImages: boolean;
}

export function ControlPanel({
  settings,
  onSettingsChange,
  totalOriginalSize,
  hasImages,
}: ControlPanelProps) {
  const estimatedSavings = totalOriginalSize > 0
    ? estimateSavings(totalOriginalSize, settings.quality)
    : 0;

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Postavke
      </h2>

      {/* Quality Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="quality"
            className="text-sm text-[var(--text-secondary)]"
          >
            Kvaliteta
          </label>
          <span className="text-sm font-semibold text-[var(--accent)] font-mono">
            {settings.quality}%
          </span>
        </div>

        <input
          type="range"
          id="quality"
          min="1"
          max="100"
          value={settings.quality}
          onChange={(e) => onSettingsChange({ quality: Number(e.target.value) })}
          className="w-full"
        />

        <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-2 font-mono uppercase tracking-wider">
          <span>Manja veličina</span>
          <span>Veća kvaliteta</span>
        </div>

        {hasImages && estimatedSavings > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success)]/20">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-sm text-[var(--success)]">
                <span className="font-medium">Procijenjena ušteda:</span>{' '}
                <span className="font-mono">~{formatBytes(estimatedSavings)}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resize Options */}
      <div className="border-t border-[var(--border)] pt-5">
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="enableResize"
            className="text-sm text-[var(--text-secondary)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Resize
          </label>
          <button
            id="enableResize"
            role="switch"
            aria-checked={settings.enableResize}
            onClick={() => onSettingsChange({ enableResize: !settings.enableResize })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
              ${settings.enableResize
                ? 'bg-[var(--accent)]'
                : 'bg-[var(--border)]'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                ${settings.enableResize ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {settings.enableResize && (
          <div className="space-y-4 animate-slide-down">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="maxWidth"
                  className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider"
                >
                  Max širina
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxWidth"
                    min="1"
                    max="10000"
                    value={settings.maxWidth}
                    onChange={(e) => onSettingsChange({ maxWidth: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 text-sm font-mono border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] font-mono">
                    px
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="maxHeight"
                  className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider"
                >
                  Max visina
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxHeight"
                    min="1"
                    max="10000"
                    value={settings.maxHeight}
                    onChange={(e) => onSettingsChange({ maxHeight: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 text-sm font-mono border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] font-mono">
                    px
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aspect ratio će biti automatski očuvan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
