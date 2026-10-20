'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Boxes,
  Layers,
  CreditCard,
  Percent,
  CalendarCheck,
  Receipt,
  Key,
  Plug,
  Palette,
  FileDown,
  Languages,
  Settings,
  ShieldAlert,
  Activity,
  User,
  KeyRound,
} from 'lucide-react';

interface SuperadminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SuperadminSidebar({ isOpen = false, onClose }: SuperadminSidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navSections = [
    {
      group: 'Principal',
      items: [
        { href: '/superadmin', label: t('nav.dashboard'), icon: LayoutDashboard },
        { href: '/superadmin/usuarios', label: t('nav.users'), icon: Users },
        { href: '/superadmin/clientes', label: t('nav.clients'), icon: Briefcase },
        { href: '/superadmin/tenants', label: t('nav.tenants'), icon: Building2 },
      ],
    },
    {
      group: 'Catálogo & Oferta',
      items: [
        { href: '/superadmin/modulos', label: t('nav.modules'), icon: Boxes },
        { href: '/superadmin/planes', label: t('nav.plans'), icon: Layers },
        { href: '/superadmin/precios', label: t('nav.prices'), icon: CreditCard },
        { href: '/superadmin/descuentos', label: t('nav.discounts'), icon: Percent },
      ],
    },
    {
      group: 'Facturación & Licencias',
      items: [
        { href: '/superadmin/suscripciones', label: t('nav.subscriptions'), icon: CalendarCheck },
        { href: '/superadmin/pagos', label: t('nav.payments'), icon: Receipt },
        { href: '/superadmin/licencias', label: t('nav.licenses'), icon: Key },
      ],
    },
    {
      group: 'Ecosistema',
      items: [
        { href: '/superadmin/plugins', label: t('nav.plugins'), icon: Plug },
        { href: '/superadmin/temas', label: t('nav.themes'), icon: Palette },
        { href: '/superadmin/importadores', label: t('nav.importers'), icon: FileDown },
      ],
    },
    {
      group: 'Plataforma & Control',
      items: [
        { href: '/superadmin/idiomas', label: t('nav.locales'), icon: Languages },
        { href: '/superadmin/configuracion', label: t('nav.settings'), icon: Settings },
        { href: '/superadmin/auditoria', label: t('nav.audit'), icon: ShieldAlert },
        { href: '/superadmin/sistema', label: t('nav.system'), icon: Activity },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-[#111111] border-r border-neutral-800 text-neutral-300 flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 lg:hidden flex items-center justify-between border-b border-neutral-800 bg-[#161616]">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Menú Superadmin</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
          >
            Cerrar
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6">
          {navSections.map(sec => (
            <div key={sec.group}>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {sec.group}
              </div>
              <ul className="space-y-1">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#D71920] text-white font-semibold shadow-md shadow-red-950/50'
                            : 'text-neutral-300 hover:text-white hover:bg-[#1B1B1B]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Quick Security links */}
        <div className="p-3 border-t border-neutral-800 bg-[#0E0E0E] text-[11px] space-y-1">
          <Link
            href="/superadmin/perfil"
            onClick={onClose}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span>{t('header.profile')}</span>
          </Link>
          <Link
            href="/superadmin/cambiar-contrasena"
            onClick={onClose}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#D71920]" />
            <span>{t('header.changePassword')}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
