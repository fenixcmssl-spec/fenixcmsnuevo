'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/superadmin/LanguageSwitcher';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { Flame, Briefcase, Boxes, Key, CreditCard, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

function ClientPortalContent() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'licenses'>('overview');

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#171717] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#111111] text-white border-b border-neutral-800 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Fenix<span className="text-[#D71920]">CMS</span>
            </span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            {t('zone.clientPortal')} (Zona 2)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/superadmin"
            className="text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Ir a Superadmin →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-xl border border-[#DDDDDD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-[#D71920]" />
              <h1 className="text-xl font-bold text-[#171717]">Cuenta de Cliente FenixCMS</h1>
            </div>
            <p className="text-xs sm:text-sm text-[#626262]">
              Titular: <span className="font-semibold text-[#171717]">Carlos Mendoza</span> (carlos@latotaltienda.es) · Tenant: <span className="font-semibold text-[#171717]">La Total Tienda</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111111] hover:bg-[#1B1B1B] text-white text-xs font-bold transition-colors"
            >
              <span>Abrir Administración de Tienda</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Contracted Plan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Plan Contratado</span>
            <div className="mt-2 text-xl font-extrabold text-[#171717]">E-commerce Pro (Tienda + Blog)</div>
            <div className="mt-1 flex items-center justify-between text-xs text-[#626262]">
              <span>Tarifa: 49.00 € / mes</span>
              <StatusBadge status="ACTIVE" label="Al corriente" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Módulos Activos</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-[#D71920] border border-red-200">ecommerce</span>
              <span className="px-2 py-1 rounded text-xs font-bold bg-neutral-100 text-[#171717] border border-neutral-200">blog</span>
            </div>
            <p className="mt-2 text-[11px] text-[#626262]">Aprovisionamiento verificado en servidor</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Licencia y Dominio</span>
            <div className="mt-2 font-mono text-xs font-bold text-[#171717] truncate">
              FNX-PRO-2026-TOT-88912-SPA
            </div>
            <div className="mt-1 text-xs text-[#626262]">
              Dominio: <span className="font-semibold text-emerald-700">latotaltienda.es</span> (SSL Activo)
            </div>
          </div>
        </div>

        {/* Extensions & Services Available */}
        <div className="bg-white rounded-lg border border-[#DDDDDD] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#D71920]" />
              <h2 className="text-sm font-bold text-[#171717]">Módulos y Extensiones de su Tienda</h2>
            </div>
            <span className="text-xs text-[#626262]">Gestionado por FenixCMS SaaS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">Tienda Online E-commerce</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">Activo</span>
              </div>
              <p className="text-xs text-[#626262]">Catálogo con stock, cesta interactiva y pasarela de cobros configurada.</p>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900">Blog Editorial & Artículos</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">Activo</span>
              </div>
              <p className="text-xs text-[#626262]">Publicación de artículos y posicionamiento SEO con microdatos automáticos.</p>
            </div>

            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#171717]">Subastas en Tiempo Real</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200 text-[#626262]">Disponible</span>
              </div>
              <p className="text-xs text-[#626262]">Amplíe su tienda para permitir pujas e incrementos dinámicos.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#626262] border-t border-[#DDDDDD] bg-white">
        FenixCMS · Portal de Clientes SaaS
      </footer>
    </div>
  );
}

export default function ClientPortalPage() {
  return <ClientPortalContent />;
}
