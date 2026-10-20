'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SupportedLocale } from '@/lib/i18n/translations';

export default function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = availableLocales.find(l => l.code === locale) || availableLocales[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-[#1B1B1B] hover:bg-[#252525] border border-neutral-700 text-neutral-200 transition-colors"
        aria-label="Seleccionar idioma"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="hidden sm:inline">{current.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-[#1B1B1B] border border-neutral-700 shadow-xl py-1 text-sm text-neutral-200">
          <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
            Idioma / Language (7)
          </div>
          {availableLocales.map(loc => (
            <button
              key={loc.code}
              type="button"
              onClick={() => {
                setLocale(loc.code as SupportedLocale);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-[#2A2A2A] transition-colors ${
                loc.code === locale ? 'text-white font-bold bg-[#D71920]/20' : 'text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{loc.flag}</span>
                <span>{loc.nativeName}</span>
                <span className="text-[10px] text-neutral-400">({loc.code.toUpperCase()})</span>
              </div>
              {loc.code === locale && <Check className="w-3.5 h-3.5 text-[#D71920]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
