'use client';

import React from 'react';
import Link from 'next/link';
import { I18nProvider, useI18n } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/superadmin/LanguageSwitcher';
import {
  Flame,
  ShieldCheck,
  Building2,
  Boxes,
  Languages,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

function HomePageContent() {
  const { t, locale } = useI18n();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#171717] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#111111] text-white border-b border-neutral-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D71920] to-[#A81218] flex items-center justify-center shadow-lg shadow-red-950">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Fenix<span className="text-[#D71920]">CMS</span>
              </span>
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 uppercase">
                SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/superadmin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#D71920] hover:bg-[#A81218] text-white text-xs font-bold transition-all shadow-md shadow-red-950"
            >
              <span>Acceso Superadmin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#111111] text-white py-16 px-4 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D71920]" />
            <span>Fase 1 Ampliada: Núcleo Técnico y Panel Superadmin</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Plataforma CMS SaaS Multi-Tenant con Tienda Online Integrada
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Gestión centralizada multi-dominio y multi-idioma (7 idiomas nativos) con arquitectura moderna basada en Next.js, Prisma, PostgreSQL y control de seguridad en servidor.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/superadmin"
              className="px-6 py-3 rounded-lg bg-[#D71920] hover:bg-[#A81218] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-red-950 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar a Superadministración</span>
            </Link>
            <Link
              href="/tienda"
              className="px-6 py-3 rounded-lg bg-[#1B1B1B] hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#D71920]" />
              <span>Explorar Tienda Online Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The 4 Separated Zones from Section 4 */}
      <section className="max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8 flex-1">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Separación Estricta de las 4 Zonas de la Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-[#626262] mt-1">
              Arquitectura aislada por rutas, roles de autenticación, sesiones en servidor y dominios verificables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Zone 1: Superadmin */}
            <div className="bg-white rounded-xl border-2 border-[#111111] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#111111] text-white uppercase">
                    Zona 1
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#D71920]" />
                </div>
                <h3 className="text-base font-bold text-[#171717]">Superadministración</h3>
                <p className="text-xs text-[#626262] mt-1 leading-relaxed">
                  Panel técnico global: usuarios, clientes, tenants, módulos, precios, licencias, auditoría y salud del sistema.
                </p>
                <div className="mt-3 p-2 rounded bg-neutral-100 text-[11px] font-mono text-[#171717]">
                  fenixcms.es/superadmin
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DDDDDD]">
                <Link
                  href="/superadmin"
                  className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded bg-[#111111] hover:bg-[#1B1B1B] text-white text-xs font-bold transition-colors"
                >
                  <span>Abrir Superadmin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Zone 2: Client Portal */}
            <div className="bg-white rounded-xl border border-[#DDDDDD] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                    Zona 2
                  </span>
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-[#171717]">Portal de Clientes</h3>
                <p className="text-xs text-[#626262] mt-1 leading-relaxed">
                  Acceso para titulares SaaS: consultar módulos contratados, planes activos, licencias y renovaciones.
                </p>
                <div className="mt-3 p-2 rounded bg-neutral-100 text-[11px] font-mono text-[#171717]">
                  fenixcms.es/login
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DDDDDD]">
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded border border-[#DDDDDD] bg-white hover:bg-neutral-50 text-[#171717] text-xs font-bold transition-colors"
                >
                  <span>Acceder al Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Zone 3: Store Admin */}
            <div className="bg-white rounded-xl border border-[#DDDDDD] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 uppercase">
                    Zona 3
                  </span>
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-[#171717]">Administración de Tienda</h3>
                <p className="text-xs text-[#626262] mt-1 leading-relaxed">
                  Gestión privada de un comercio cliente: control de catálogo, stock, productos, pedidos e inventario.
                </p>
                <div className="mt-3 p-2 rounded bg-neutral-100 text-[11px] font-mono text-[#171717]">
                  latotaltienda.es/admin
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DDDDDD]">
                <Link
                  href="/admin"
                  className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded border border-[#DDDDDD] bg-white hover:bg-neutral-50 text-[#171717] text-xs font-bold transition-colors"
                >
                  <span>Administrar Tienda</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Zone 4: Online Store */}
            <div className="bg-white rounded-xl border-2 border-[#D71920] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-[#D71920] uppercase">
                    Zona 4
                  </span>
                  <ShoppingBag className="w-5 h-5 text-[#D71920]" />
                </div>
                <h3 className="text-base font-bold text-[#171717]">Tienda Online Integrada</h3>
                <p className="text-xs text-[#626262] mt-1 leading-relaxed">
                  Frontal de compra para clientes: catálogo interactivo, cesta de compra, cálculo de importes y checkout.
                </p>
                <div className="mt-3 p-2 rounded bg-neutral-100 text-[11px] font-mono text-[#171717]">
                  latotaltienda.es/tienda
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DDDDDD]">
                <Link
                  href="/tienda"
                  className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded bg-[#D71920] hover:bg-[#A81218] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Ver Tienda Online</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Core Modules Showcase */}
        <div className="bg-white rounded-xl border border-[#DDDDDD] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDDDD] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#171717]">
                Los 6 Módulos Nucleares Listos de FenixCMS
              </h2>
              <p className="text-xs text-[#626262]">
                Diseño extensible que permite a cada tenant contratar cualquier combinación o plan comercial.
              </p>
            </div>
            <Link href="/superadmin/modulos" className="text-xs font-semibold text-[#D71920] hover:underline">
              Gestionar Catálogo →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'ecommerce', name: 'Tienda Online E-commerce', desc: 'Catálogo de artículos, control de existencias, cesta interactiva y pasarelas de pago.' },
              { code: 'blog', name: 'Blog & Editorial', desc: 'Publicaciones dinámicas, autores, categorías, etiquetas y optimización SEO nativa.' },
              { code: 'real_estate', name: 'Inmobiliaria', desc: 'Inmuebles residenciales y comerciales con planos, superficie y localización geográfica.' },
              { code: 'auction', name: 'Subastas Online', desc: 'Pujas en directo, temporizadores con cuenta regresiva e incrementos automáticos.' },
              { code: 'classifieds', name: 'Anuncios Clasificados', desc: 'Plataforma de anuncios entre particulares y profesionales con moderación.' },
              { code: 'personal_ads', name: 'Contactos y Personales', desc: 'Directorio privado de perfiles con filtros estrictos de privacidad y moderación.' },
            ].map(m => (
              <div key={m.code} className="p-4 rounded-lg border border-[#DDDDDD] bg-neutral-50/50">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-[#171717] uppercase">
                  {m.code}
                </span>
                <h4 className="font-bold text-sm text-[#171717] mt-1.5">{m.name}</h4>
                <p className="text-xs text-[#626262] mt-1 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 bg-[#111111] text-white border-t border-neutral-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#D71920]" />
            <span className="font-bold">FenixCMS SaaS</span>
            <span className="text-neutral-500">· Fase 1 Ampliada Completa</span>
          </div>
          <div className="text-neutral-400 text-center sm:text-right">
            7 Idiomas · PostgreSQL & Prisma · Multi-Tenant · Cero barra de búsqueda
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return <HomePageContent />;
}
