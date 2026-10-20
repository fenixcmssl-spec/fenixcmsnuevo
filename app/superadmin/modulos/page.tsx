'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Boxes, Check, Eye } from 'lucide-react';

export default function ModulosPage() {
  const { t } = useI18n();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/modules?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setModules(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [statusFilter]);

  const toggleStatus = async (mod: any) => {
    const nextStatus = mod.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch('/api/superadmin/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mod.id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        fetchModules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Módulo & Identificador',
      sortable: true,
      render: m => (
        <div>
          <div className="font-bold text-[#171717]">{m.name}</div>
          <div className="text-[11px] font-mono text-[#D71920]">código: {m.code}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción Funcional',
      render: m => <span className="text-xs text-[#626262] max-w-xs block">{m.description}</span>,
    },
    {
      key: 'category',
      header: 'Categoría',
      sortable: true,
      render: m => (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-[#171717]">
          {m.category}
        </span>
      ),
    },
    {
      key: 'version',
      header: 'Versión',
      render: m => <span className="text-xs font-mono text-[#626262]">v{m.version}</span>,
    },
    {
      key: 'isCore',
      header: 'Núcleo',
      render: m => (
        <span className={`text-xs font-bold ${m.isCore ? 'text-blue-700' : 'text-neutral-500'}`}>
          {m.isCore ? 'Core Fenix' : 'Extensible'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: m => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: m => (
        <button
          type="button"
          onClick={() => toggleStatus(m)}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
            m.status === 'PUBLISHED'
              ? 'border border-amber-300 text-amber-800 hover:bg-amber-50'
              : 'border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          {m.status === 'PUBLISHED' ? 'Ocultar' : 'Publicar'}
        </button>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.modules')}
        subtitle="Catálogo oficial de los 6 módulos nucleares con compatibilidad multi-tenant modular."
      />

      <DataTable
        columns={columns}
        data={modules}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'PUBLISHED (Publicado)', value: 'PUBLISHED' },
          { label: 'DRAFT (Borrador)', value: 'DRAFT' },
          { label: 'DEPRECATED (Obsoleto)', value: 'DEPRECATED' },
        ]}
      />
    </SuperadminLayout>
  );
}
