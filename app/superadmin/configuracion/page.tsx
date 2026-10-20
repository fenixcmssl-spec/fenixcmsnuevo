'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function ConfiguracionPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/superadmin/settings');
      const json = await res.json();
      if (json.ok) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, value: val } : s))
    );
  };

  const handleSave = async (key: string, val: string) => {
    try {
      const res = await fetch('/api/superadmin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val }),
      });
      const json = await res.json();
      if (json.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.settings')}
        subtitle="Ajustes centrales del sistema, almacenamiento, localización y políticas de seguridad."
      />

      {savedSuccess && (
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuración guardada satisfactoriamente.</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#DDDDDD] p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map(s => (
            <div key={s.id} className="p-4 rounded-lg border border-[#DDDDDD] bg-neutral-50/50 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#D71920] block mb-1">
                  {s.key}
                </span>
                <span className="text-[11px] text-[#626262] block mb-3">
                  Categoría: {s.category} · Actualizado: {new Date(s.updatedAt).toLocaleDateString()}
                </span>
                <input
                  type="text"
                  value={s.value}
                  onChange={e => handleChange(s.key, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div className="mt-3 pt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleSave(s.key, s.value)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-[#111111] hover:bg-[#1B1B1B] text-white transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('action.save')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperadminLayout>
  );
}
