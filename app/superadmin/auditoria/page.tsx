'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import { useI18n } from '@/lib/i18n/context';
import { ShieldAlert } from 'lucide-react';

export default function AuditoriaPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/audit?action=${actionFilter}`);
      const json = await res.json();
      if (json.ok) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [actionFilter]);

  const columns: Column<any>[] = [
    {
      key: 'action',
      header: 'Acción Ejecutada',
      sortable: true,
      render: l => (
        <div>
          <span className="font-bold text-xs text-[#171717]">{l.action}</span>
          <div className="text-[11px] text-[#626262]">Recurso: {l.resource}</div>
        </div>
      ),
    },
    {
      key: 'userEmail',
      header: 'Operador / Usuario',
      sortable: true,
      render: l => (
        <span className="text-xs font-mono text-[#171717]">
          {l.userEmail || 'Sistema Automático'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Detalle de Operación',
      render: l => (
        <span className="text-[11px] font-mono text-[#626262] max-w-sm truncate block">
          {l.details}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Dirección IP',
      render: l => <span className="font-mono text-xs text-[#626262]">{l.ipAddress}</span>,
    },
    {
      key: 'createdAt',
      header: 'Estampa Temporal (UTC)',
      sortable: true,
      render: l => (
        <span className="text-xs text-[#626262]">
          {new Date(l.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.audit')}
        subtitle="Registro inmutable de trazabilidad de operaciones críticas, accesos y modificaciones."
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        filterLabel="Filtrar por Acción"
        currentFilter={actionFilter}
        onFilterChange={setActionFilter}
        filterOptions={[
          { label: 'Todas las acciones', value: 'ALL' },
          { label: 'LOGIN_SUCCESS', value: 'LOGIN_SUCCESS' },
          { label: 'USER_CREATED', value: 'USER_CREATED' },
          { label: 'TENANT_CREATED', value: 'TENANT_CREATED' },
          { label: 'PASSWORD_CHANGED', value: 'PASSWORD_CHANGED' },
          { label: 'LICENSE_ISSUED', value: 'LICENSE_ISSUED' },
        ]}
      />
    </SuperadminLayout>
  );
}
