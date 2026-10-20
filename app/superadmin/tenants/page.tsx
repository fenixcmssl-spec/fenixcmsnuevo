'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { Building2, Globe, ShieldCheck, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const { t } = useI18n();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [formError, setFormError] = useState('');

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/tenants?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setTenants(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/superadmin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          ownerEmail,
          primaryDomain,
          authorizedModules: ['ecommerce', 'blog'],
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFormError(json?.error?.message || t('msg.error'));
      } else {
        setIsModalOpen(false);
        setName('');
        setSlug('');
        setOwnerEmail('');
        setPrimaryDomain('');
        fetchTenants();
      }
    } catch {
      setFormError(t('msg.error'));
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Tenant & Slug',
      sortable: true,
      render: item => (
        <div>
          <div className="font-bold text-[#171717]">{item.name}</div>
          <div className="text-[11px] font-mono text-[#626262]">slug: {item.slug}</div>
        </div>
      ),
    },
    {
      key: 'primaryDomain',
      header: 'Dominios Asociados',
      render: item => (
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-xs text-[#171717]">
            <Globe className="w-3.5 h-3.5 text-[#D71920]" />
            <span>{item.primaryDomain || `${item.slug}.fenixcms.es`}</span>
          </div>
          <div className="text-[11px] text-[#626262]">
            {item.domains?.length || 1} dominio(s) verificados
          </div>
        </div>
      ),
    },
    {
      key: 'ownerEmail',
      header: 'Propietario',
      render: item => (
        <div>
          <div className="text-xs font-medium text-[#171717]">{item.ownerName}</div>
          <div className="text-[11px] text-[#626262] font-mono">{item.ownerEmail}</div>
        </div>
      ),
    },
    {
      key: 'authorizedModules',
      header: 'Módulos Activos',
      render: item => (
        <div className="flex flex-wrap gap-1">
          {item.authorizedModules?.map((m: string) => (
            <span
              key={m}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-[#171717] border border-neutral-200"
            >
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: item => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Acceso Tienda',
      render: () => (
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-[#D71920] hover:underline font-semibold"
          title="Ver panel de administración de tienda del tenant"
        >
          <span>/admin</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.tenants')}
        subtitle="Espacios multi-tenant, dominios verificados y aprovisionamiento aislado."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Tenant</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={tenants}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE', value: 'ACTIVE' },
          { label: 'TRIAL', value: 'TRIAL' },
          { label: 'SUSPENDED', value: 'SUSPENDED' },
        ]}
      />

      {/* Modal Nuevo Tenant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Aprovisionar Nuevo Tenant</h3>
            {formError && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Nombre Comercial del Tenant" required>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  required
                  placeholder="Ej: Joyería Madrid Central"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Slug Único (Identificador)" required helpText="Solo minúsculas y guiones">
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  required
                  placeholder="joyeria-madrid"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Correo del Cliente Titular" required>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  required
                  placeholder="contacto@joyeriamadrid.com"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Dominio Principal">
                <input
                  type="text"
                  value={primaryDomain}
                  onChange={e => setPrimaryDomain(e.target.value)}
                  placeholder="joyeriamadrid.es"
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
                  {t('action.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperadminLayout>
  );
}
