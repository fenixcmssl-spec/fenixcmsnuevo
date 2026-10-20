'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { Layers, Plus, Check } from 'lucide-react';

export default function PlanesPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['ecommerce']);
  const [formError, setFormError] = useState('');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/plans?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) {
        setPlans(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/superadmin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          description,
          modules: selectedModules,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFormError(json?.error?.message || t('msg.error'));
      } else {
        setIsModalOpen(false);
        setCode('');
        setName('');
        setDescription('');
        fetchPlans();
      }
    } catch {
      setFormError(t('msg.error'));
    }
  };

  const toggleModuleSelection = (modCode: string) => {
    if (selectedModules.includes(modCode)) {
      setSelectedModules(selectedModules.filter(m => m !== modCode));
    } else {
      setSelectedModules([...selectedModules, modCode]);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Plan & Código',
      sortable: true,
      render: p => (
        <div>
          <div className="font-bold text-[#171717]">{p.name}</div>
          <div className="text-[11px] font-mono text-[#626262]">{p.code}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: p => <span className="text-xs text-[#626262] max-w-sm block">{p.description}</span>,
    },
    {
      key: 'modules',
      header: 'Módulos Incluidos',
      render: p => (
        <div className="flex flex-wrap gap-1">
          {p.modules?.map((m: string) => (
            <span
              key={m}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#D71920] border border-red-200"
            >
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isCustom',
      header: 'Tipo',
      render: p => (
        <span className="text-xs font-semibold text-[#171717]">
          {p.isCustom ? 'A Medida' : 'Estándar'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: p => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.plans')}
        subtitle="Agrupaciones de módulos y combinaciones comerciales estándar o personalizadas."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Plan</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={plans}
        isLoading={loading}
        filterLabel="Filtrar por Estado"
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE', value: 'ACTIVE' },
          { label: 'ARCHIVED', value: 'ARCHIVED' },
        ]}
      />

      {/* Modal Crear Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Crear Nuevo Plan Comercial</h3>
            {formError && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Nombre del Plan" required>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!code) setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                  }}
                  required
                  placeholder="Ej: E-commerce + Subastas Pro"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Código de Plan" required>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  placeholder="ecommerce_auction_pro"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Descripción">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Módulos a Incluir en el Plan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['ecommerce', 'blog', 'real_estate', 'auction', 'classifieds', 'personal_ads'].map(m => {
                    const selected = selectedModules.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleModuleSelection(m)}
                        className={`px-3 py-2 text-xs rounded border text-left font-medium transition-all ${
                          selected
                            ? 'bg-[#D71920] text-white border-[#D71920]'
                            : 'bg-neutral-50 text-[#171717] border-[#DDDDDD] hover:bg-neutral-100'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

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
