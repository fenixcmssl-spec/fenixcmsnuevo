'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n, I18nProvider } from '@/lib/i18n/context';
import LanguageSwitcher from '@/components/superadmin/LanguageSwitcher';
import { Flame, Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('admin@fenixcms.es');
  const [password, setPassword] = useState('Admin123!*Fenix');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMessage(json?.error?.message || t('auth.invalidCredentials'));
      } else {
        router.push('/superadmin');
        router.refresh();
      }
    } catch {
      setErrorMessage(t('msg.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col justify-between text-neutral-100">
      {/* Top Bar with Brand & Language Switcher */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D71920] to-[#A81218] flex items-center justify-center shadow-lg shadow-red-950/60">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white">
              Fenix<span className="text-[#D71920]">CMS</span>
            </span>
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 uppercase">
              Superadmin
            </span>
          </div>
        </div>

        <LanguageSwitcher />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1B1B1B] rounded-xl border border-neutral-800 p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-full bg-red-950/60 border border-red-800/80 items-center justify-center text-[#D71920] mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('auth.loginTitle')}
            </h1>
            <p className="mt-1.5 text-xs text-neutral-400">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-md bg-red-950/40 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@fenixcms.es"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-md text-xs sm:text-sm text-white focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920] pl-10"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-md text-xs sm:text-sm text-white focus:outline-none focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920] pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#D71920] hover:bg-[#A81218] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('msg.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.loginButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seed credentials helper box for development and testing */}
          <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-300">Credenciales del primer Superadmin:</span>
            <div className="mt-1 font-mono text-neutral-300 bg-neutral-900 p-2 rounded border border-neutral-800">
              admin@fenixcms.es / Admin123!*Fenix
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-neutral-500 border-t border-neutral-800">
        FenixCMS SaaS Platform · Fase 1 Núcleo Técnico
      </footer>
    </div>
  );
}

export default function SuperadminLoginPage() {
  return <LoginFormContent />;
}
