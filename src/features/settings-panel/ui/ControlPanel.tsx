'use client';

import { ConversionSettings, OUTPUT_FORMATS, BG_REMOVAL_QUALITIES, BG_REMOVAL_MODES } from '@/shared/types';
import { formatBytes } from '@/shared/lib/formatBytes';
import { estimateSavings } from '@/features/convert-image';
import { Tooltip } from '@/shared/ui/Tooltip';

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
  const estimatedSavingsValue = totalOriginalSize > 0
    ? estimateSavings(totalOriginalSize, settings.quality)
    : 0;

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Postavke konverzije
      </h2>

      {/* Quality Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Tooltip content="Viša kvaliteta = veća datoteka, bolja oštrina slike. Niža kvaliteta = manja datoteka, vidljiva kompresija.">
            <label
              htmlFor="quality"
              className="text-sm text-[var(--text-secondary)] cursor-help flex items-center gap-1"
            >
              Kvaliteta
              <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </label>
          </Tooltip>
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

        {hasImages && estimatedSavingsValue > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success)]/20">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-sm text-[var(--success)]">
                <span className="font-medium">Procijenjena ušteda:</span>{' '}
                <span className="font-mono">~{formatBytes(estimatedSavingsValue)}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Output Format Selector */}
      <div className="border-t border-[var(--border)] pt-5 mb-6">
        <label className="block text-sm text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Izlazni format
        </label>
        <div className="grid grid-cols-4 gap-2">
          {OUTPUT_FORMATS.map((format) => (
            <button
              key={format.value}
              onClick={() => onSettingsChange({ outputFormat: format.value })}
              className={`
                px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${settings.outputFormat === format.value
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/25'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {format.label}
            </button>
          ))}
        </div>
        {settings.outputFormat === 'avif' && (
          <p className="mt-2 text-[10px] text-[var(--warning)] flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            AVIF nije podržan u svim browserima (Safari)
          </p>
        )}
        {settings.outputFormat === 'png' && (
          <p className="mt-2 text-[10px] text-[var(--text-tertiary)] flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PNG je lossless format - kvaliteta se ne primjenjuje
          </p>
        )}
      </div>

      {/* Metadata Strip Toggle */}
      <div className="border-t border-[var(--border)] pt-5 mb-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor="stripMetadata"
            className="text-sm text-[var(--text-secondary)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Ukloni metapodatke
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${settings.stripMetadata ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
              {settings.stripMetadata ? 'UKLJ' : 'ISKLJ'}
            </span>
            <button
              id="stripMetadata"
              role="switch"
              aria-checked={settings.stripMetadata}
              onClick={() => onSettingsChange({ stripMetadata: !settings.stripMetadata })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                ${settings.stripMetadata
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--border)]'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                  ${settings.stripMetadata ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[var(--text-tertiary)]">
          Uklanja GPS lokaciju, info o kameri, datum snimanja...
        </p>
      </div>

      {/* Background Removal Toggle */}
      <div className="border-t border-[var(--border)] pt-5 mb-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor="removeBackground"
            className="text-sm text-[var(--text-secondary)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            Ukloni pozadinu
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${settings.removeBackground ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
              {settings.removeBackground ? 'UKLJ' : 'ISKLJ'}
            </span>
            <button
              id="removeBackground"
              role="switch"
              aria-checked={settings.removeBackground}
              onClick={() => onSettingsChange({ removeBackground: !settings.removeBackground })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                ${settings.removeBackground
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--border)]'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                  ${settings.removeBackground ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
        {settings.removeBackground && (
          <div className="mt-3 space-y-4 animate-slide-down">
            {/* Mode Selector */}
            <div>
              <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                Način uklanjanja
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BG_REMOVAL_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => onSettingsChange({ bgRemovalMode: mode.value })}
                    className={`
                      px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 text-left flex items-center gap-2
                      ${settings.bgRemovalMode === mode.value
                        ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/25'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
                      }
                    `}
                  >
                    {mode.icon === 'brain' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    )}
                    <div>
                      <span className="block">{mode.label}</span>
                      <span className={`block text-[9px] mt-0.5 ${settings.bgRemovalMode === mode.value ? 'opacity-80' : 'text-[var(--text-tertiary)]'}`}>
                        {mode.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Mode Options */}
            {settings.bgRemovalMode === 'ai' && (
              <>
                {/* Quality Selector */}
                <div>
                  <label className="block text-[10px] font-medium text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    Kvaliteta AI modela
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BG_REMOVAL_QUALITIES.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => onSettingsChange({ bgRemovalQuality: q.value })}
                        className={`
                          px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-center
                          ${settings.bgRemovalQuality === q.value
                            ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent)]/25'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
                          }
                        `}
                        title={q.description}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] text-[var(--text-tertiary)]">
                    {BG_REMOVAL_QUALITIES.find(q => q.value === settings.bgRemovalQuality)?.description}
                  </p>
                </div>

                {/* Edge Refinement */}
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      Pročišćavanje rubova
                    </label>
                    <button
                      role="switch"
                      aria-checked={settings.refineEdges}
                      onClick={() => onSettingsChange({ refineEdges: !settings.refineEdges })}
                      className={`
                        relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200
                        ${settings.refineEdges ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}
                      `}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${settings.refineEdges ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {settings.refineEdges && (
                    <div className="animate-slide-down">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[var(--text-tertiary)]">Intenzitet</span>
                        <span className="text-[10px] text-[var(--accent)] font-mono">{settings.edgeBlur}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={settings.edgeBlur}
                        onChange={(e) => onSettingsChange({ edgeBlur: Number(e.target.value) })}
                        className="w-full h-1"
                      />
                      <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mt-1">
                        <span>Oštrije</span>
                        <span>Glatkije</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Warning */}
                <div className="p-3 rounded-xl bg-[var(--warning-muted)] border border-[var(--warning)]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[var(--warning)] font-medium">AI obrada</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                        {settings.bgRemovalQuality === 'fast' && 'Brza obrada, ~10-15s po slici'}
                        {settings.bgRemovalQuality === 'balanced' && 'Balansirana obrada, ~15-25s po slici'}
                        {settings.bgRemovalQuality === 'maximum' && 'Maksimalna kvaliteta, ~30-60s po slici'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Color Mode Options */}
            {settings.bgRemovalMode === 'color' && (
              <>
                {/* Tolerance Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[var(--text-secondary)]">Tolerancija boje</label>
                    <span className="text-xs font-semibold text-[var(--accent)] font-mono">{settings.bgColorTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={settings.bgColorTolerance}
                    onChange={(e) => onSettingsChange({ bgColorTolerance: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1">
                    <span>Preciznije</span>
                    <span>Šire područje</span>
                  </div>
                </div>

                {/* Color Mode Info */}
                <div className="p-3 rounded-xl bg-[var(--success-muted)] border border-[var(--success)]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[var(--success)] font-medium">Brzo uklanjanje</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                        Auto-detekcija boje pozadine. Idealno za logotipe s bijelom ili jednobojnom pozadinom.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {settings.removeBackground && settings.outputFormat === 'jpeg' && (
          <div className="mt-2 p-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 animate-slide-down">
            <p className="text-[10px] text-[var(--error)] flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              JPEG ne podržava transparentnost - pozadina će biti bijela
            </p>
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
            Promjena veličine
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${settings.enableResize ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
              {settings.enableResize ? 'UKLJ' : 'ISKLJ'}
            </span>
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
