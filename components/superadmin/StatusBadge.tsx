'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const norm = (status || '').toUpperCase();
  const display = label || status;

  let colorClass = 'bg-neutral-100 text-neutral-800 border-neutral-300';

  if (['ACTIVE', 'PUBLISHED', 'SUCCEEDED', 'VERIFIED', 'COMPLETED', 'OPERATIONAL', 'HEALTHY'].includes(norm)) {
    colorClass = 'bg-emerald-50 text-[#167D45] border-emerald-200';
  } else if (['TRIAL', 'TRIALING', 'PENDING', 'REVIEW', 'BETA'].includes(norm)) {
    colorClass = 'bg-amber-50 text-[#9A5B00] border-amber-200';
  } else if (['SUSPENDED', 'FAILED', 'REJECTED', 'CANCELED', 'REVOKED', 'EXPIRED'].includes(norm)) {
    colorClass = 'bg-rose-50 text-[#B42318] border-rose-200';
  } else if (['DRAFT', 'DEPRECATED', 'ARCHIVED'].includes(norm)) {
    colorClass = 'bg-neutral-100 text-neutral-600 border-neutral-300';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {display}
    </span>
  );
}
