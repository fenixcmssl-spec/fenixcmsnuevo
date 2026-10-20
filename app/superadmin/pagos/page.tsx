'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Receipt, CreditCard } from 'lucide-react';

export default function PagosPage() {
  const { t } = useI18n();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/payments?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setPayments(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const columns: Column<any>[] = [
    {
      key: 'transactionId',
      header: 'ID Transacción & Pasarela',
      sortable: true,
      render: p => (
        <div>
          <div className="font-mono text-xs font-bold text-[#171717]">{p.transactionId || p.id}</div>
          <div className="text-[11px] text-[#626262]">Proveedor: {p.provider}</div>
        </div>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant Emisor',
      sortable: true,
      render: p => <span className="font-semibold text-xs text-[#171717]">{p.tenantName}</span>,
    },
    {
      key: 'amount',
      header: 'Importe Cobrado',
      sortable: true,
      render: p => (
        <span className="text-xs font-bold text-[#171717]">
          {p.amount.toFixed(2)} {p.currency}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha de Cobro',
      sortable: true,
      render: p => (
        <span className="text-xs text-[#626262]">
          {new Date(p.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado Verificado',
      sortable: true,
      render: p => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.payments')}
        subtitle="Registro oficial de cobros realizados en servidor sin validación insegura desde cliente."
      />

      <DataTable
        columns={columns}
        data={payments}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'SUCCEEDED (Completado)', value: 'SUCCEEDED' },
          { label: 'PENDING (Pendiente)', value: 'PENDING' },
          { label: 'FAILED (Fallido)', value: 'FAILED' },
        ]}
      />
    </SuperadminLayout>
  );
}
