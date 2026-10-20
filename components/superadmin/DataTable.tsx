'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  filterLabel?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  currentFilter?: string;
  secondaryFilterLabel?: string;
  secondaryFilterOptions?: FilterOption[];
  onSecondaryFilterChange?: (value: string) => void;
  currentSecondaryFilter?: string;
  itemsPerPage?: number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  filterLabel,
  filterOptions,
  onFilterChange,
  currentFilter,
  secondaryFilterLabel,
  secondaryFilterOptions,
  onSecondaryFilterChange,
  currentSecondaryFilter,
  itemsPerPage = 10,
  emptyMessage = 'No se encontraron registros.',
  isLoading = false,
}: DataTableProps<T>) {
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortKey, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#DDDDDD] shadow-xs overflow-hidden">
      {/* Table Control Header: ONLY Allowed Dropdown Selectors (Rule 9: Strictly NO text search bar) */}
      {(filterOptions || secondaryFilterOptions) && (
        <div className="p-4 border-b border-[#DDDDDD] bg-neutral-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#626262]">
              <Filter className="w-3.5 h-3.5 text-[#D71920]" />
              <span>{t('action.filter')}:</span>
            </div>

            {filterOptions && onFilterChange && (
              <div className="flex items-center gap-2">
                {filterLabel && <span className="text-xs text-[#626262]">{filterLabel}:</span>}
                <select
                  value={currentFilter || 'ALL'}
                  onChange={e => {
                    setCurrentPage(1);
                    onFilterChange(e.target.value);
                  }}
                  className="text-xs bg-white border border-[#DDDDDD] rounded px-3 py-1.5 font-medium text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  {filterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {secondaryFilterOptions && onSecondaryFilterChange && (
              <div className="flex items-center gap-2">
                {secondaryFilterLabel && (
                  <span className="text-xs text-[#626262]">{secondaryFilterLabel}:</span>
                )}
                <select
                  value={currentSecondaryFilter || 'ALL'}
                  onChange={e => {
                    setCurrentPage(1);
                    onSecondaryFilterChange(e.target.value);
                  }}
                  className="text-xs bg-white border border-[#DDDDDD] rounded px-3 py-1.5 font-medium text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  {secondaryFilterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-xs font-medium text-[#626262]">
            Total: <span className="font-bold text-[#171717]">{sortedData.length}</span> registros
          </div>
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#DDDDDD] bg-neutral-100 text-[#171717]">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold text-[#171717] whitespace-nowrap"
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-[#D71920] transition-colors"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDDDDD] bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#626262]">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#D71920] border-t-transparent mr-2 align-middle" />
                  <span>{t('msg.loading')}</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#626262]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-[#171717]">
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > 0 && (
        <div className="p-4 border-t border-[#DDDDDD] bg-neutral-50/50 flex items-center justify-between text-xs text-[#626262]">
          <div>
            Página <span className="font-semibold text-[#171717]">{currentPage}</span> de{' '}
            <span className="font-semibold text-[#171717]">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded border border-[#DDDDDD] bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded border border-[#DDDDDD] bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
