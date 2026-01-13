'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/shared/ui/ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
