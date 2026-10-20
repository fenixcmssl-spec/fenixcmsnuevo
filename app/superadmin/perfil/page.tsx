'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, User, Mail, Calendar, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const { t } = useI18n();

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('header.profile')}
        subtitle="Información de la cuenta con privilegios máximos del sistema FenixCMS."
        badge="Superadministrador"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg border border-[#DDDDDD] p-6 shadow-xs text-center">
          <div className="w-20 h-20 rounded-full bg-[#111111] border-2 border-[#D71920] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            SA
          </div>
          <h2 className="text-base font-bold text-[#171717]">Superadministrador Principal</h2>
          <p className="text-xs text-[#626262] mt-0.5">admin@fenixcms.es</p>
          <div className="mt-3">
            <StatusBadge status="ACTIVE" label="Activo" />
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDDDDD]">
            <Link
              href="/superadmin/cambiar-contrasena"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-[#D71920] text-white hover:bg-[#A81218] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t('header.changePassword')}</span>
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg border border-[#DDDDDD] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#171717] pb-2 border-b border-[#DDDDDD]">
            Detalles de Seguridad & Roles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded bg-neutral-50 border border-neutral-200">
              <span className="text-[#626262] block mb-1">Rol en Plataforma:</span>
              <span className="font-bold text-[#171717] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                SUPERADMIN (Acceso Total)
              </span>
            </div>

            <div className="p-3 rounded bg-neutral-50 border border-neutral-200">
              <span className="text-[#626262] block mb-1">Mecanismo de Autenticación:</span>
              <span className="font-bold text-[#171717]">Argon2id / bcrypt Hash + Cookie HttpOnly</span>
            </div>

            <div className="p-3 rounded bg-neutral-50 border border-neutral-200">
              <span className="text-[#626262] block mb-1">Ámbito de Autorización:</span>
              <span className="font-bold text-[#171717]">Global (Multi-Tenant & Dominios)</span>
            </div>

            <div className="p-3 rounded bg-neutral-50 border border-neutral-200">
              <span className="text-[#626262] block mb-1">Último Acceso Registrado:</span>
              <span className="font-bold text-[#171717]">2026-10-20 08:01:00 UTC</span>
            </div>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  );
}
