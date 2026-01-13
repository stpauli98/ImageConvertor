'use client';

import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (licenseKey: string) => boolean;
  remainingToday: number;
  dailyLimit: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  onActivate,
  remainingToday,
  dailyLimit,
}: UpgradeModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [showLicenseInput, setShowLicenseInput] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    setError('');
    const success = onActivate(licenseKey);
    if (success) {
      onClose();
      setLicenseKey('');
      setShowLicenseInput(false);
    } else {
      setError('Neispravan license key. Provjerite i pokušajte ponovo.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-[var(--accent-muted)] to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent)]/30">
            <svg className="w-7 h-7 text-[var(--text-inverse)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">
            Dnevni limit dostignut
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Iskoristili ste {dailyLimit - remainingToday} od {dailyLimit} besplatnih konverzija danas
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-[var(--text-tertiary)]">
              <span>Današnja potrošnja</span>
              <span>{dailyLimit - remainingToday}/{dailyLimit}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${((dailyLimit - remainingToday) / dailyLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Premium features */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Premium uključuje:
            </p>
            <ul className="space-y-2">
              {[
                'Neograničene konverzije',
                'Svi formati (WebP, AVIF, PNG, JPG)',
                'Custom kvalitet i resize',
                'Prioritetna podrška',
                'Bez reklama zauvijek',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <svg className="w-4 h-4 text-[var(--success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <a
            href="https://webpconvert.lemonsqueezy.com/buy/premium"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full text-center"
          >
            <span>Nadogradi na Premium</span>
            <span className="text-sm opacity-80">— $9 jednokratno</span>
          </a>

          {/* License key section */}
          {!showLicenseInput ? (
            <button
              onClick={() => setShowLicenseInput(true)}
              className="w-full text-center text-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
            >
              Već imate license key?
            </button>
          ) : (
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-secondary)]">
                Unesite vaš license key:
              </p>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  setError('');
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] font-mono text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              {error && (
                <p className="text-sm text-[var(--error)]">{error}</p>
              )}
              <button
                onClick={handleActivate}
                disabled={!licenseKey}
                className="btn btn-secondary w-full"
              >
                Aktiviraj Premium
              </button>
            </div>
          )}

          {/* Alternative */}
          <p className="text-center text-xs text-[var(--text-tertiary)]">
            Ili sačekajte do sutra za novih {dailyLimit} besplatnih konverzija
          </p>
        </div>
      </div>
    </div>
  );
}
