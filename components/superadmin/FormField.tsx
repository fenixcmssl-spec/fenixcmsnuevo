'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export default function FormField({
  label,
  error,
  required,
  children,
  helpText,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#171717]">
        {label}
        {required && <span className="text-[#D71920] ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-[11px] text-[#626262]">{helpText}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-[#B42318]">{error}</p>
      )}
    </div>
  );
}
