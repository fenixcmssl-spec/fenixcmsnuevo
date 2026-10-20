'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { CalendarCheck } from 'lucide-react';

export default function SuscripcionesPage() {
  const { t } = useI18n();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/subscriptions?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setSubs(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, [statusFilter]);

  const columns: Column<any>[] = [
    {
      key: 'tenantName',
      header: 'Tenant Suscriptor',
      sortable: true,
      render: s => (
        <div>
          <div className="font-bold text-[#171717]">{s.tenantName}</div>
          <div className="text-[11px] font-mono text-[#626262]">id: {s.tenantId}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Plan Contratado',
      sortable: true,
      render: s => (
        <div>
          <div className="font-semibold text-xs text-[#171717]">{s.planName}</div>
          <div className="text-[11px] text-[#626262]">Ciclo: {s.billingCycle}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Importe Acordado',
      sortable: true,
      render: s => (
        <span className="text-xs font-bold text-[#171717]">
          {s.price.toFixed(2)} {s.currency}
        </span>
      ),
    },
    {
      key: 'currentPeriodEnd',
      header: 'Vencimiento Periodo',
      sortable: true,
      render: s => (
        <span className="text-xs text-[#626262]">
          {new Date(s.currentPeriodEnd).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: s => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.subscriptions')}
        subtitle="Control del ciclo de vida de suscripciones SaaS de los clientes y tenants."
      />

      <DataTable
        columns={columns}
        data={subs}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE (Activo)', value: 'ACTIVE' },
          { label: 'TRIALING (Prueba)', value: 'TRIALING' },
          { label: 'PAST_DUE (Vencido)', value: 'PAST_DUE' },
          { label: 'CANCELED (Cancelado)', value: 'CANCELED' },
        ]}
      />
    </SuperadminLayout>
  );
}
