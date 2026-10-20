'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-[#DDDDDD] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`p-2.5 rounded-full ${
                isDestructive ? 'bg-red-100 text-[#D71920]' : 'bg-amber-100 text-[#9A5B00]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#171717]">{title}</h3>
              <p className="mt-1.5 text-xs text-[#626262] leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-[#DDDDDD] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold rounded border border-[#DDDDDD] bg-white text-[#171717] hover:bg-neutral-100 transition-colors"
          >
            {cancelLabel || t('action.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-semibold rounded text-white shadow-xs transition-colors ${
              isDestructive
                ? 'bg-[#D71920] hover:bg-[#A81218]'
                : 'bg-[#111111] hover:bg-[#1B1B1B]'
            }`}
          >
            {confirmLabel || t('action.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
