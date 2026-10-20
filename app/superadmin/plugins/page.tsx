'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Plug, ShieldCheck, Check } from 'lucide-react';

export default function PluginsPage() {
  const { t } = useI18n();
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/plugins?category=${categoryFilter}`);
      const json = await res.json();
      if (json.ok) {
        setPlugins(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [categoryFilter]);

  const toggleStatus = async (item: any) => {
    const nextStatus = item.status === 'PUBLISHED' ? 'REVIEW' : 'PUBLISHED';
    try {
      const res = await fetch('/api/superadmin/plugins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.ok) fetchPlugins();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Extensión / Plugin',
      sortable: true,
      render: p => (
        <div>
          <div className="font-bold text-[#171717]">{p.name}</div>
          <div className="text-[11px] font-mono text-[#626262]">slug: {p.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción Funcional',
      render: p => <span className="text-xs text-[#626262] max-w-sm block">{p.description}</span>,
    },
    {
      key: 'version',
      header: 'Versión & Autor',
      render: p => (
        <div>
          <span className="font-mono text-xs font-semibold text-[#171717]">v{p.version}</span>
          <div className="text-[11px] text-[#626262]">{p.author}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Licencia / Precio',
      render: p => (
        <span className="text-xs font-bold text-[#171717]">
          {p.isFree ? 'Gratuito' : `${p.price.toFixed(2)} €`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: p => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Control',
      render: p => (
        <button
          type="button"
          onClick={() => toggleStatus(p)}
          className="px-2.5 py-1 text-xs font-semibold rounded border border-[#DDDDDD] hover:bg-neutral-100"
        >
          {p.status === 'PUBLISHED' ? 'Revisión' : 'Publicar'}
        </button>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.plugins')}
        subtitle="Registro y metadatos de extensiones del ecosistema FenixCMS con validación aislada."
      />

      <DataTable
        columns={columns}
        data={plugins}
        isLoading={loading}
        filterLabel="Filtrar por Categoría"
        currentFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        filterOptions={[
          { label: 'Todas las categorías', value: 'ALL' },
          { label: 'marketing', value: 'marketing' },
          { label: 'payment', value: 'payment' },
          { label: 'communication', value: 'communication' },
          { label: 'ai_tools', value: 'ai_tools' },
        ]}
      />
    </SuperadminLayout>
  );
}
