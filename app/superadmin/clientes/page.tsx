'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import { useI18n } from '@/lib/i18n/context';
import { Briefcase, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ClientesPage() {
  const { t } = useI18n();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/users?role=CLIENT&status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setClients(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Cliente Titular',
      sortable: true,
      render: c => (
        <div>
          <div className="font-bold text-[#171717]">{c.name}</div>
          <div className="text-[11px] text-[#626262] font-mono">{c.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado Cuenta',
      sortable: true,
      render: c => <StatusBadge status={c.status} />,
    },
    {
      key: 'emailVerified',
      header: 'Verificación',
      render: c => (
        <span className={`text-xs font-semibold ${c.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
          {c.emailVerified ? 'Verificado' : 'Pendiente'}
        </span>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Último Acceso',
      sortable: true,
      render: c => (
        <span className="text-xs text-[#626262]">
          {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : 'Sin registros'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Cliente Desde',
      sortable: true,
      render: c => (
        <span className="text-xs text-[#626262]">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Portal Cliente',
      render: () => (
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs text-[#D71920] hover:underline font-semibold"
          title="Abrir portal de cliente FenixCMS"
        >
          <span>Acceso Portal</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.clients')}
        subtitle="Cuentas empresariales y profesionales que contratan servicios FenixCMS."
      />

      <DataTable
        columns={columns}
        data={clients}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE', value: 'ACTIVE' },
          { label: 'SUSPENDED', value: 'SUSPENDED' },
          { label: 'PENDING', value: 'PENDING' },
        ]}
      />
    </SuperadminLayout>
  );
}
