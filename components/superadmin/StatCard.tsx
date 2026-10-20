'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-5 border border-[#DDDDDD] shadow-xs hover:border-neutral-400 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#626262]">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-[#111111]">
            <Icon className="w-4 h-4 text-[#D71920]" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717]">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendPositive ? 'text-[#167D45]' : 'text-[#B42318]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#626262] font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
