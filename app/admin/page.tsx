'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/superadmin/LanguageSwitcher';
import StatusBadge from '@/components/superadmin/StatusBadge';
import {
  ShoppingBag,
  Package,
  Layers,
  Settings,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Plus,
  ExternalLink,
  Flame,
} from 'lucide-react';

function StoreAdminContent() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const products = [
    { id: '1', name: 'Auriculares Inalámbricos Pro ANC', price: 129.99, stock: 45, category: 'Electrónica', status: 'ACTIVE' },
    { id: '2', name: 'Reloj Inteligente Fenix Chrono Titan', price: 249.50, stock: 22, category: 'Tecnología', status: 'ACTIVE' },
    { id: '3', name: 'Mochila Urbana Impermeable Roll-Top', price: 79.00, stock: 80, category: 'Accesorios', status: 'ACTIVE' },
    { id: '4', name: 'Cámara Mirrorless 4K Cine Edition', price: 899.00, stock: 12, category: 'Fotografía', status: 'ACTIVE' },
  ];

  const orders = [
    { id: 'ord_1001', customer: 'Javier Navarro', email: 'j.navarro@gmail.com', items: 1, total: 129.99, status: 'COMPLETED', date: '2026-10-19' },
    { id: 'ord_1002', customer: 'Elena Blanco', email: 'e.blanco@hotmail.com', items: 2, total: 328.50, status: 'COMPLETED', date: '2026-10-20' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#171717] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#111111] text-white border-b border-neutral-800 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D71920] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                La Total Tienda <span className="text-[#D71920]">Admin</span>
              </span>
            </div>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 hidden sm:inline">
            {t('zone.storeAdmin')} (Zona 3)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/tienda"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#D71920] hover:bg-[#A81218] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>Ver Tienda Online</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* Banner with Tenant info */}
        <div className="bg-white rounded-xl border border-[#DDDDDD] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#171717]">Panel de Gestión del Comercio</h1>
            <p className="text-xs text-[#626262] mt-0.5">
              Dominio activo: <span className="font-semibold text-emerald-700">latotaltienda.es</span> · Tenant ID: <span className="font-mono text-xs">ten_latotaltienda</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/superadmin"
              className="text-xs text-[#626262] hover:text-[#171717] px-3 py-1.5 rounded border border-[#DDDDDD] bg-white transition-colors"
            >
              ← Ir a Superadmin FenixCMS
            </Link>
          </div>
        </div>

        {/* Store KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Ventas Acumuladas</span>
            <div className="mt-2 text-2xl font-extrabold text-[#171717]">458.49 €</div>
            <p className="mt-1 text-xs text-emerald-700 font-medium">2 pedidos completados</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Catálogo de Productos</span>
            <div className="mt-2 text-2xl font-extrabold text-[#171717]">{products.length} artículos</div>
            <p className="mt-1 text-xs text-[#626262]">Control de inventario en tiempo real</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#DDDDDD] shadow-xs">
            <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">Pasarela Activa</span>
            <div className="mt-2 text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Stripe & Redsys Conectados</span>
            </div>
            <p className="mt-1 text-[11px] text-[#626262]">Modo Comercio Seguro</p>
          </div>
        </div>

        {/* Tabs: Products or Orders */}
        <div className="bg-white rounded-lg border border-[#DDDDDD] shadow-xs overflow-hidden">
          <div className="flex border-b border-[#DDDDDD] bg-neutral-50 px-4 pt-3 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'products'
                  ? 'border-[#D71920] text-[#D71920]'
                  : 'border-transparent text-[#626262] hover:text-[#171717]'
              }`}
            >
              Productos del Catálogo ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
                activeTab === 'orders'
                  ? 'border-[#D71920] text-[#D71920]'
                  : 'border-transparent text-[#626262] hover:text-[#171717]'
              }`}
            >
              Pedidos Recibidos ({orders.length})
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            {activeTab === 'products' ? (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DDDDDD] text-[#626262]">
                    <th className="pb-2 font-semibold">Producto</th>
                    <th className="pb-2 font-semibold">Categoría</th>
                    <th className="pb-2 font-semibold">Precio</th>
                    <th className="pb-2 font-semibold">Stock</th>
                    <th className="pb-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDDDD]">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 font-bold text-[#171717]">{p.name}</td>
                      <td className="py-2.5 text-[#626262]">{p.category}</td>
                      <td className="py-2.5 font-bold text-[#171717]">{p.price.toFixed(2)} €</td>
                      <td className="py-2.5 font-mono">{p.stock} uds.</td>
                      <td className="py-2.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DDDDDD] text-[#626262]">
                    <th className="pb-2 font-semibold">ID Pedido</th>
                    <th className="pb-2 font-semibold">Cliente</th>
                    <th className="pb-2 font-semibold">Importe</th>
                    <th className="pb-2 font-semibold">Fecha</th>
                    <th className="pb-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDDDDD]">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 font-mono font-bold text-[#D71920]">{o.id}</td>
                      <td className="py-2.5">
                        <div className="font-semibold text-[#171717]">{o.customer}</div>
                        <div className="text-[11px] text-[#626262]">{o.email}</div>
                      </td>
                      <td className="py-2.5 font-bold text-[#171717]">{o.total.toFixed(2)} €</td>
                      <td className="py-2.5 text-xs text-[#626262]">{o.date}</td>
                      <td className="py-2.5"><StatusBadge status={o.status} label="Completado" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#626262] border-t border-[#DDDDDD] bg-white">
        La Total Tienda · Administración de Comercio con Tecnología FenixCMS
      </footer>
    </div>
  );
}

export default function StoreAdminPage() {
  return <StoreAdminContent />;
}
