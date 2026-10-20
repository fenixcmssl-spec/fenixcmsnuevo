'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { FileDown } from 'lucide-react';

export default function ImportadoresPage() {
  const { t } = useI18n();
  const [importers, setImporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('ALL');

  const fetchImporters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/importers?platform=${platformFilter}`);
      const json = await res.json();
      if (json.ok) {
        setImporters(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImporters();
  }, [platformFilter]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Herramienta Migradora',
      sortable: true,
      render: imp => (
        <div>
          <div className="font-bold text-[#171717]">{imp.name}</div>
          <div className="text-[11px] font-mono text-[#626262]">slug: {imp.slug}</div>
        </div>
      ),
    },
    {
      key: 'sourcePlatform',
      header: 'Plataforma Origen',
      sortable: true,
      render: imp => (
        <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-neutral-900 text-white">
          {imp.sourcePlatform}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Alcance de Datos',
      render: imp => <span className="text-xs text-[#626262] max-w-sm block">{imp.description}</span>,
    },
    {
      key: 'version',
      header: 'Versión Motor',
      render: imp => <span className="font-mono text-xs text-[#626262]">v{imp.version}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: imp => <StatusBadge status={imp.status} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.importers')}
        subtitle="Motores de migración asistida desde WordPress, WooCommerce, Shopify y PrestaShop."
      />

      <DataTable
        columns={columns}
        data={importers}
        isLoading={loading}
        filterLabel="Filtrar por Plataforma Origen"
        currentFilter={platformFilter}
        onFilterChange={setPlatformFilter}
        filterOptions={[
          { label: 'Todas las plataformas', value: 'ALL' },
          { label: 'WOOCOMMERCE', value: 'WOOCOMMERCE' },
          { label: 'SHOPIFY', value: 'SHOPIFY' },
          { label: 'PRESTASHOP', value: 'PRESTASHOP' },
        ]}
      />
    </SuperadminLayout>
  );
}
