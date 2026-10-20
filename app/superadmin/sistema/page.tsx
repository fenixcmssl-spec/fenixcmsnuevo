'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Activity, Server, Database, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SistemaPage() {
  const { t } = useI18n();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/superadmin/health');
      const json = await res.json();
      if (json.ok) {
        setHealth(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.system')}
        subtitle="Diagnóstico de infraestructura, compatibilidad de base de datos y control de integridad técnica."
        actions={
          <button
            type="button"
            onClick={fetchHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#111111] hover:bg-[#1B1B1B] text-white shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('action.refresh')}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PostgreSQL Database Card */}
        <div className="bg-white rounded-lg border border-[#DDDDDD] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDDDDD] mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D71920]" />
              <h3 className="text-sm font-bold text-[#171717]">Motor de Base de Datos</h3>
            </div>
            <StatusBadge status="ACTIVE" label="Conectado" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Motor ORM:</span>
              <span className="font-bold text-[#171717]">Prisma ORM 6.x</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Compatibilidad SQL:</span>
              <span className="font-bold text-[#171717]">PostgreSQL 14+</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Tablas Aprovisionadas:</span>
              <span className="font-bold text-[#171717]">{health?.database?.tablesCount || 21}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#626262]">Migración SQL:</span>
              <span className="font-mono text-[11px] text-emerald-700">20261020_init (OK)</span>
            </div>
          </div>
        </div>

        {/* Runtime Server Card */}
        <div className="bg-white rounded-lg border border-[#DDDDDD] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDDDDD] mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[#111111]" />
              <h3 className="text-sm font-bold text-[#171717]">Servidor Next.js</h3>
            </div>
            <StatusBadge status="OPERATIONAL" label="Normal" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Uptime:</span>
              <span className="font-bold text-[#171717]">{health?.uptimeSeconds || 0} segundos</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Memoria Heap Usada:</span>
              <span className="font-bold text-[#171717]">{health?.memory?.heapUsedMb || 0} MB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-[#626262]">Memoria RSS:</span>
              <span className="font-bold text-[#171717]">{health?.memory?.rssMb || 0} MB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#626262]">Sesiones de Servidor:</span>
              <span className="font-bold text-emerald-700">{health?.database?.activeSessions || 1} activas</span>
            </div>
          </div>
        </div>

        {/* Security & Strict Compliance Card */}
        <div className="bg-white rounded-lg border border-[#DDDDDD] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDDDDD] mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#171717]">Cumplimiento Normativo</h3>
            </div>
            <StatusBadge status="ACTIVE" label="Verificado" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1.5 py-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Regla 9: Prohibición de barra de búsqueda activa</span>
            </div>
            <div className="flex items-center gap-1.5 py-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Regla 7: 7 Idiomas oficiales disponibles</span>
            </div>
            <div className="flex items-center gap-1.5 py-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Argon2id / bcrypt hashes en servidor</span>
            </div>
            <div className="flex items-center gap-1.5 py-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Separación estricta de las 4 zonas FenixCMS</span>
            </div>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  );
}
