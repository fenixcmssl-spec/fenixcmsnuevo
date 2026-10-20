'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { Key, Plus, ShieldCheck } from 'lucide-react';

export default function LicenciasPage() {
  const { t } = useI18n();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [maxDomains, setMaxDomains] = useState('5');

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/licenses?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setLicenses(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/superadmin/tenants');
      const json = await res.json();
      if (json.ok && json.data.length > 0) {
        setTenants(json.data);
        setSelectedTenantId(json.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLicenses();
    fetchTenants();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          maxDomains: Number(maxDomains),
          maxTenants: 1,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setIsModalOpen(false);
        fetchLicenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (lic: any) => {
    const nextStatus = lic.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    try {
      const res = await fetch('/api/superadmin/licenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lic.id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        fetchLicenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'licenseKey',
      header: 'Clave de Licencia Fenix',
      sortable: true,
      render: l => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#171717]">
          <Key className="w-3.5 h-3.5 text-[#D71920]" />
          <span>{l.licenseKey}</span>
        </div>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant Asignado',
      sortable: true,
      render: l => <span className="font-semibold text-xs text-[#171717]">{l.tenantName}</span>,
    },
    {
      key: 'limits',
      header: 'Límites Dominios / Activaciones',
      render: l => (
        <span className="text-xs text-[#626262]">
          {l.activationsCount} activados de {l.maxDomains} máx.
        </span>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Caducidad',
      sortable: true,
      render: l => (
        <span className="text-xs text-[#626262]">
          {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : 'Permanente'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: l => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: l => (
        <button
          type="button"
          onClick={() => toggleStatus(l)}
          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
            l.status === 'ACTIVE'
              ? 'border border-rose-300 text-rose-800 hover:bg-rose-50'
              : 'border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          {l.status === 'ACTIVE' ? t('action.revoke') : t('action.activate')}
        </button>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.licenses')}
        subtitle="Generación de claves de activación criptográficas y restricciones multi-dominio."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generar Clave</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={licenses}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE (Activa)', value: 'ACTIVE' },
          { label: 'SUSPENDED (Suspendida)', value: 'SUSPENDED' },
          { label: 'REVOKED (Revocada)', value: 'REVOKED' },
          { label: 'EXPIRED (Expirada)', value: 'EXPIRED' },
        ]}
      />

      {/* Modal Nueva Licencia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Emitir Nueva Licencia de Activación</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Seleccionar Tenant Destino" required>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Límite Máximo de Dominios Autorizados" required>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxDomains}
                  onChange={e => setMaxDomains(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs border border-[#DDDDDD] rounded hover:bg-neutral-100"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs"
                >
                  {t('action.generate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperadminLayout>
  );
}
