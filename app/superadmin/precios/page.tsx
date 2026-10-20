'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { CreditCard, Plus } from 'lucide-react';

export default function PreciosPage() {
  const { t } = useI18n();
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [targetCode, setTargetCode] = useState('pro_ecommerce');
  const [targetType, setTargetType] = useState<'PLAN' | 'MODULE'>('PLAN');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [priceAmount, setPriceAmount] = useState('49.00');

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/prices?cycle=${cycleFilter}`);
      const json = await res.json();
      if (json.ok) {
        setPrices(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [cycleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/superadmin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCode,
          targetType,
          billingCycle,
          price: Number(priceAmount),
          currency: 'EUR',
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setIsModalOpen(false);
        fetchPrices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'targetCode',
      header: 'Elemento Tarifario',
      sortable: true,
      render: p => (
        <div>
          <div className="font-bold text-[#171717]">{p.targetCode}</div>
          <div className="text-[11px] text-[#626262]">Tipo: {p.targetType}</div>
        </div>
      ),
    },
    {
      key: 'billingCycle',
      header: 'Periodicidad',
      sortable: true,
      render: p => (
        <span className="font-semibold text-xs px-2.5 py-0.5 rounded bg-neutral-100 text-[#171717] border border-neutral-200">
          {p.billingCycle}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Precio Oficial',
      sortable: true,
      render: p => (
        <span className="text-sm font-extrabold text-[#171717]">
          {p.price.toFixed(2)} {p.currency}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Vigencia',
      render: p => <StatusBadge status={p.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.prices')}
        subtitle="Configuración de tarifas para periodicidad mensual, trimestral, semestral y anual."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Tarifa</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={prices}
        isLoading={loading}
        filterLabel="Filtrar por Periodicidad"
        currentFilter={cycleFilter}
        onFilterChange={setCycleFilter}
        filterOptions={[
          { label: 'Todas las periodicidades', value: 'ALL' },
          { label: 'MONTHLY (Mensual)', value: 'MONTHLY' },
          { label: 'QUARTERLY (Trimestral)', value: 'QUARTERLY' },
          { label: 'SEMIANNUAL (Semestral)', value: 'SEMIANNUAL' },
          { label: 'ANNUAL (Anual)', value: 'ANNUAL' },
        ]}
      />

      {/* Modal Nueva Tarifa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Añadir Tarifa Oficial</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Identificador de Plan o Módulo" required>
                <input
                  type="text"
                  value={targetCode}
                  onChange={e => setTargetCode(e.target.value)}
                  required
                  placeholder="pro_ecommerce"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Periodicidad" required>
                <select
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="QUARTERLY">Trimestral</option>
                  <option value="SEMIANNUAL">Semestral</option>
                  <option value="ANNUAL">Anual</option>
                </select>
              </FormField>

              <FormField label="Importe en EUR" required>
                <input
                  type="number"
                  step="0.01"
                  value={priceAmount}
                  onChange={e => setPriceAmount(e.target.value)}
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
