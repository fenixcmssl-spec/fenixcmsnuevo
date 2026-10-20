'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Palette } from 'lucide-react';

export default function TemasPage() {
  const { t } = useI18n();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/themes?category=${categoryFilter}`);
      const json = await res.json();
      if (json.ok) {
        setThemes(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [categoryFilter]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Tema Visual & Estilo',
      sortable: true,
      render: thm => (
        <div>
          <div className="font-bold text-[#171717]">{thm.name}</div>
          <div className="text-[11px] font-mono text-[#626262]">slug: {thm.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción & Audiencia',
      render: thm => <span className="text-xs text-[#626262] max-w-sm block">{thm.description}</span>,
    },
    {
      key: 'category',
      header: 'Categoría',
      sortable: true,
      render: thm => (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-[#171717]">
          {thm.category}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Autor / Versión',
      render: thm => (
        <div className="text-xs text-[#626262]">
          <div>{thm.author}</div>
          <div className="font-mono text-[11px]">v{thm.version}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: thm => <StatusBadge status={thm.status} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.themes')}
        subtitle="Catálogo de temas visuales para tiendas y portales con identidad de alta conversión."
      />

      <DataTable
        columns={columns}
        data={themes}
        isLoading={loading}
        filterLabel="Filtrar por Categoría"
        currentFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        filterOptions={[
          { label: 'Todas las categorías', value: 'ALL' },
          { label: 'ecommerce', value: 'ecommerce' },
          { label: 'fashion', value: 'fashion' },
          { label: 'auction', value: 'auction' },
        ]}
      />
    </SuperadminLayout>
  );
}
