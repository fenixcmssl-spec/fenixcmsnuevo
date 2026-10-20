import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'FenixCMS - Plataforma SaaS Multi-Tenant y Tienda Online',
  description: 'FenixCMS SaaS: Núcleo técnico multi-tenant, multi-dominio y multi-idioma (7 idiomas) con catálogo de módulos, planes, plugins, temas y tienda online e-commerce integrada.',
  openGraph: {
    title: 'FenixCMS - Plataforma SaaS Multi-Tenant',
    description: 'FenixCMS SaaS: Plataforma CMS para gestión de tiendas online, dominios y módulos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FenixCMS SaaS',
    description: 'CMS SaaS multi-dominio y multi-idioma con tienda online integrada.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F4F5F7] text-[#171717] antialiased" suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

