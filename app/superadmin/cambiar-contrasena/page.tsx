'use client';

import React, { useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function CambiarContrasenaPage() {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('password.mismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/superadmin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMessage(json?.error?.message || t('msg.error'));
      } else {
        setSuccessMessage(t('password.success'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setErrorMessage(t('msg.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('password.title')}
        subtitle={t('password.subtitle')}
        badge="Seguridad"
      />

      <div className="max-w-2xl bg-white rounded-lg border border-[#DDDDDD] p-6 shadow-xs">
        {successMessage && (
          <div className="mb-5 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label={t('password.current')} required>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2 text-[#626262] hover:text-[#171717]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label={t('password.new')}
            required
            helpText="Mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo."
          >
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2 text-[#626262] hover:text-[#171717]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <FormField label={t('password.confirm')} required>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
            />
          </FormField>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded bg-[#D71920] hover:bg-[#A81218] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? t('msg.loading') : t('password.submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </SuperadminLayout>
  );
}
