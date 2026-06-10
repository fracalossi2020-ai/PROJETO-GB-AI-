'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useFinanceiroData } from './useFinanceiroData';

type FinanceiroContextType = ReturnType<typeof useFinanceiroData>;

const FinanceiroContext = createContext<FinanceiroContextType | null>(null);

export function FinanceiroProvider({ children }: { children: ReactNode }) {
  const data = useFinanceiroData();
  return (
    <FinanceiroContext.Provider value={data}>
      {children}
    </FinanceiroContext.Provider>
  );
}

export function useFinanceiroCtx() {
  const ctx = useContext(FinanceiroContext);
  if (!ctx) {
    throw new Error('useFinanceiroCtx deve ser usado dentro de FinanceiroProvider');
  }
  return ctx;
}
