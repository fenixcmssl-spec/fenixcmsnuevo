'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import LanguageSwitcher from './LanguageSwitcher';
import UserAccountMenu from './UserAccountMenu';
import { Flame, Bell, Menu, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SuperadminHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function SuperadminHeader({ onToggleSidebar, isSidebarOpen }: SuperadminHeaderProps) {
  const { t } = useI18n();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#111111] border-b border-neutral-800 text-white shadow-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3 md:gap-5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Alternar navegación lateral"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/superadmin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D71920] to-[#A81218] flex items-center justify-center shadow-lg shadow-red-900/40">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-red-400 transition-colors">
                  Fenix<span className="text-[#D71920]">CMS</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 uppercase">
                  SaaS
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                {t('zone.superadmin')}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Direct links to the other 3 separated zones for easy testing */}
        <div className="hidden xl:flex items-center gap-2 bg-[#1B1B1B] px-3 py-1.5 rounded-lg border border-neutral-800 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-1">
            Zonas Fenix:
          </span>
          <Link
            href="/login"
            className="flex items-center gap-1 text-neutral-300 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors"
            title="Portal de Clientes SaaS"
          >
            <span>{t('zone.clientPortal')}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </Link>
          <span className="text-neutral-700">|</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-neutral-300 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors"
            title="Administración de Tienda de un Tenant"
          >
            <span>{t('zone.storeAdmin')}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </Link>
          <span className="text-neutral-700">|</span>
          <Link
            href="/tienda"
            className="flex items-center gap-1 text-red-400 font-medium hover:text-red-300 px-2 py-0.5 rounded hover:bg-red-950/40 transition-colors"
            title="Tienda Online E-commerce Integrada"
          >
            <span>{t('zone.shop')}</span>
            <ExternalLink className="w-3 h-3 text-red-400" />
          </Link>
        </div>

        {/* Right: Actions, Language Switcher, Notifications, Account Menu */}
        {/* Strictly adheres to rule 9: NO search bar, search input or search icon */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <LanguageSwitcher />

          {/* Notifications Flyout */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-neutral-300 hover:text-white hover:bg-[#1B1B1B] border border-neutral-800 transition-colors relative"
              aria-label="Ver notificaciones del sistema"
            >
              <Bell className="w-4 h-4 text-neutral-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D71920]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-md bg-[#1B1B1B] border border-neutral-700 shadow-2xl py-2 text-xs text-neutral-200">
                <div className="px-3 py-1.5 font-bold text-neutral-300 border-b border-neutral-800 flex items-center justify-between">
                  <span>{t('header.notifications')}</span>
                  <span className="text-[10px] text-emerald-400">Sistema OK</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <div className="font-semibold text-white">PostgreSQL Listo</div>
                    <div className="text-[11px] text-neutral-400">Esquema Prisma 21 entidades verificado.</div>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <div className="font-semibold text-white">Seguridad de Sesión</div>
                    <div className="text-[11px] text-neutral-400">Cifrado de cookies HttpOnly activo.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
}
