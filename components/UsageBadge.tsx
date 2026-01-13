'use client';

interface UsageBadgeProps {
  remainingToday: number;
  dailyLimit: number;
  isPremium: boolean;
  onClick?: () => void;
}

export function UsageBadge({
  remainingToday,
  dailyLimit,
  isPremium,
  onClick,
}: UsageBadgeProps) {
  if (isPremium) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-muted)] border border-[var(--accent)]/30 rounded-full">
        <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="text-xs font-semibold text-[var(--accent)] font-mono uppercase tracking-wider">
          Premium
        </span>
      </div>
    );
  }

  const usagePercent = ((dailyLimit - remainingToday) / dailyLimit) * 100;
  const isLow = remainingToday <= 2;
  const isEmpty = remainingToday === 0;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
        ${isEmpty
          ? 'bg-[var(--error-muted)] border-[var(--error)]/30 hover:border-[var(--error)]/50'
          : isLow
            ? 'bg-[var(--warning)]/10 border-[var(--warning)]/30 hover:border-[var(--warning)]/50'
            : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--border-hover)]'
        }
      `}
    >
      {/* Mini progress ring */}
      <svg className="w-4 h-4 -rotate-90" viewBox="0 0 20 20">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke={isEmpty ? 'var(--error)' : isLow ? 'var(--warning)' : 'var(--accent)'}
          strokeWidth="2"
          strokeDasharray={`${usagePercent * 0.5} 50`}
          strokeLinecap="round"
        />
      </svg>

      <span className={`
        text-xs font-semibold font-mono
        ${isEmpty
          ? 'text-[var(--error)]'
          : isLow
            ? 'text-[var(--warning)]'
            : 'text-[var(--text-secondary)]'
        }
      `}>
        {remainingToday}/{dailyLimit}
      </span>

      {isEmpty && (
        <svg className="w-3.5 h-3.5 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
    </button>
  );
}
