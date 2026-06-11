'use client';

import { useEffect, useState, useCallback } from 'react';
import { Zap, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface TechToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = 3000;

  useEffect(() => {
    // trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`relative w-80 transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
      }`}
    >
      <div
        className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl ${
          isSuccess
            ? 'bg-[#0a0a0a]/95 border-[#ff9607]/30'
            : 'bg-[#0a0a0a]/95 border-red-500/30'
        }`}
        style={{ boxShadow: isSuccess ? '0 8px 32px rgba(255,150,7,0.15)' : '0 8px 32px rgba(239,68,68,0.15)' }}
      >
        {/* Glow accent */}
        <div
          className={`absolute top-0 left-0 w-full h-[1px] ${
            isSuccess ? 'bg-gradient-to-r from-transparent via-[#ff9607] to-transparent' : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
          }`}
        />

        {/* Icon */}
        <div
          className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isSuccess ? 'bg-[#ff9607]/10 border border-[#ff9607]/20' : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {isSuccess ? (
            <Zap className="h-4 w-4 text-[#ff9607]" />
          ) : (
            <X className="h-4 w-4 text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-snug">
            {isSuccess ? 'Sucesso!' : 'Erro'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="flex-shrink-0 text-gray-500 hover:text-white transition-colors mt-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
          <div
            className={`h-full transition-all duration-100 ease-linear ${isSuccess ? 'bg-[#ff9607]' : 'bg-red-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TechToast({ toasts, onRemove }: TechToastProps) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
