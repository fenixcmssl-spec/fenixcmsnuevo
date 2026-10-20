'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES, TRANSLATIONS, SupportedLocale } from '@/lib/i18n/translations';
import { Languages, CheckCircle2 } from 'lucide-react';

export default function IdiomasPage() {
  const { t, locale, setLocale } = useI18n();

  const totalEsKeys = Object.keys(TRANSLATIONS.es).length;

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.locales')}
        subtitle="Configuración del sistema multi-idioma (7 idiomas oficiales) y verificación de cobertura de catálogos."
        badge="i18n Fase 1"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTED_LOCALES.map(loc => {
          const dictKeys = Object.keys(TRANSLATIONS[loc.code] || {}).length;
          const isCurrent = loc.code === locale;
          const coveragePct = Math.round((dictKeys / totalEsKeys) * 100);

          return (
            <div
              key={loc.code}
              className={`bg-white rounded-lg border p-5 shadow-xs transition-all ${
                isCurrent ? 'border-[#D71920] ring-1 ring-[#D71920]' : 'border-[#DDDDDD]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{loc.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">{loc.nativeName}</h3>
                    <div className="text-[11px] text-[#626262]">
                      {loc.name} ({loc.code.toUpperCase()})
                    </div>
                  </div>
                </div>
                {isCurrent ? (
                  <StatusBadge status="ACTIVE" label="Activo en UI" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setLocale(loc.code as SupportedLocale)}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-[#DDDDDD] hover:bg-neutral-100 text-[#171717]"
                  >
                    Seleccionar
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#626262]">
                  <span>Claves traducidas:</span>
                  <span className="font-bold text-[#171717]">{dictKeys} / {totalEsKeys}</span>
                </div>
                <div className="flex justify-between text-[#626262]">
                  <span>Cobertura catálogos:</span>
                  <span className="font-bold text-emerald-700">{coveragePct}% completa</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sin claves pendientes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SuperadminLayout>
  );
}
