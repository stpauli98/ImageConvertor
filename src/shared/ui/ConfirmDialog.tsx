'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Potvrdi',
  cancelText = 'Odustani',
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus confirm button after animation
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const variantStyles = {
    danger: {
      icon: (
        <svg className="w-6 h-6 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      iconBg: 'bg-[var(--error-muted)]',
      confirmBtn: 'bg-[var(--error)] hover:bg-red-600 text-white',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-[var(--warning-muted)]',
      confirmBtn: 'bg-[var(--warning)] hover:bg-amber-600 text-white',
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-muted)]',
      confirmBtn: 'bg-[var(--accent)] hover:bg-lime-500 text-[var(--text-inverse)]',
    },
  };

  const styles = variantStyles[variant];

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="relative bg-[var(--bg-elevated)] rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-[var(--border)]"
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center mb-4`}>
            {styles.icon}
          </div>

          {/* Title */}
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-[var(--text-primary)] mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="dialog-description"
            className="text-sm text-[var(--text-secondary)] leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--border)] rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}

// Hook za lakše korištenje
interface UseConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<UseConfirmDialogOptions | null>(null);

  const showConfirm = (options: UseConfirmDialogOptions) => {
    setDialogState(options);
  };

  const closeDialog = () => {
    setDialogState(null);
  };

  const ConfirmDialogComponent = dialogState ? (
    <ConfirmDialog
      isOpen={true}
      onClose={closeDialog}
      onConfirm={dialogState.onConfirm}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
    />
  ) : null;

  return { showConfirm, ConfirmDialogComponent };
}
