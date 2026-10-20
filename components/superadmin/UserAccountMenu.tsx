'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { User, KeyRound, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

interface UserAccountMenuProps {
  userEmail?: string;
  userName?: string;
}

export default function UserAccountMenu({ userEmail = 'admin@fenixcms.es', userName = 'Superadmin' }: UserAccountMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/superadmin/auth', { method: 'DELETE' });
      router.push('/superadmin/login');
      router.refresh();
    } catch {
      router.push('/superadmin/login');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 px-3 py-1.5 text-xs rounded bg-[#1B1B1B] hover:bg-[#252525] border border-neutral-700 text-neutral-200 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[#D71920] flex items-center justify-center font-bold text-white text-[11px]">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <div className="font-semibold text-white leading-tight">{userName}</div>
          <div className="text-[10px] text-neutral-400">{userEmail}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-[#1B1B1B] border border-neutral-700 shadow-2xl py-1 text-sm text-neutral-200">
          <div className="px-4 py-2.5 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('header.adminBadge')}</span>
            </div>
            <div className="text-xs text-neutral-300 font-medium truncate">{userEmail}</div>
          </div>

          <div className="py-1">
            <Link
              href="/superadmin/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('header.profile')}</span>
            </Link>

            <Link
              href="/superadmin/cambiar-contrasena"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#D71920]" />
              <span>{t('header.changePassword')}</span>
            </Link>
          </div>

          <div className="border-t border-neutral-800 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>{t('header.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
