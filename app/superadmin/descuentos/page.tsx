'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { Percent, Plus, Tag } from 'lucide-react';

export default function DescuentosPage() {
  const { t } = useI18n();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('15');
  const [maxUses, setMaxUses] = useState('100');

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/discounts?type=${typeFilter}`);
      const json = await res.json();
      if (json.ok) {
        setDiscounts(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          type,
          value: Number(value),
          maxUses: Number(maxUses),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setIsModalOpen(false);
        setCode('');
        setName('');
        fetchDiscounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'code',
      header: 'Código Promocional',
      sortable: true,
      render: d => (
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#D71920]">
          <Tag className="w-3.5 h-3.5" />
          <span>{d.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Nombre Comercial',
      sortable: true,
      render: d => <span className="text-xs font-semibold text-[#171717]">{d.name}</span>,
    },
    {
      key: 'value',
      header: 'Descuento',
      sortable: true,
      render: d => (
        <span className="text-xs font-bold text-[#167D45]">
          {d.type === 'PERCENTAGE' ? `${d.value}%` : `${d.value.toFixed(2)} €`}
        </span>
      ),
    },
    {
      key: 'usedCount',
      header: 'Usos / Límite',
      render: d => (
        <span className="text-xs text-[#626262]">
          {d.usedCount} de {d.maxUses || 'Ilimitado'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: d => <StatusBadge status={d.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.discounts')}
        subtitle="Reglas comerciales, cupones de suscripción y verificación de tarifas en el servidor."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Descuento</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={discounts}
        isLoading={loading}
        filterLabel="Filtrar por Tipo"
        currentFilter={typeFilter}
        onFilterChange={setTypeFilter}
        filterOptions={[
          { label: 'Todos los tipos', value: 'ALL' },
          { label: 'PERCENTAGE (Porcentual)', value: 'PERCENTAGE' },
          { label: 'FIXED (Fijo en EUR)', value: 'FIXED' },
        ]}
      />

      {/* Modal Nuevo Descuento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Crear Regla de Descuento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Código de Cupón" required>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="PROMO2026"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Nombre de la Campaña" required>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Campaña Black Friday Fenix"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tipo de Descuento" required>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Importe Fijo (€)</option>
                  </select>
                </FormField>

                <FormField label="Valor" required>
                  <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                  />
                </FormField>
              </div>

              <FormField label="Límite Máximo de Usos">
                <input
                  type="number"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
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
