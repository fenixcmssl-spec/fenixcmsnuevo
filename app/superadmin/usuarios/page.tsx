'use client';

import React, { useEffect, useState } from 'react';
import SuperadminLayout from '@/components/superadmin/SuperadminLayout';
import PageHeader from '@/components/superadmin/PageHeader';
import DataTable, { Column } from '@/components/superadmin/DataTable';
import StatusBadge from '@/components/superadmin/StatusBadge';
import FormField from '@/components/superadmin/FormField';
import { useI18n } from '@/lib/i18n/context';
import { UserPlus, Shield, CheckCircle, RefreshCw } from 'lucide-react';

export default function UsuariosPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('CLIENT');
  const [newPassword, setNewPassword] = useState('Cliente123!*');
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (roleFilter !== 'ALL') query.set('role', roleFilter);
      if (statusFilter !== 'ALL') query.set('status', statusFilter);

      const res = await fetch(`/api/superadmin/users?${query.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          password: newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFormError(json?.error?.message || t('msg.error'));
      } else {
        setIsModalOpen(false);
        setNewName('');
        setNewEmail('');
        fetchUsers();
      }
    } catch {
      setFormError(t('msg.error'));
    }
  };

  const toggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Usuario',
      sortable: true,
      render: u => (
        <div>
          <div className="font-bold text-[#171717]">{u.name}</div>
          <div className="text-[11px] text-[#626262]">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol de Sistema',
      sortable: true,
      render: u => (
        <span className="font-semibold text-xs px-2 py-0.5 rounded bg-neutral-100 text-[#171717]">
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: u => <StatusBadge status={u.status} />,
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      sortable: true,
      render: u => (
        <span className="text-xs text-[#626262]">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: u => (
        <div className="flex items-center gap-2">
          {u.role !== 'SUPERADMIN' && (
            <button
              type="button"
              onClick={() => toggleStatus(u)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                u.status === 'ACTIVE'
                  ? 'border border-amber-300 text-amber-800 hover:bg-amber-50'
                  : 'border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {u.status === 'ACTIVE' ? t('action.suspend') : t('action.activate')}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <SuperadminLayout>
      <PageHeader
        title={t('nav.users')}
        subtitle="Administración de cuentas, roles de plataforma y estados de autorización."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('action.create')}</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        filterLabel="Filtrar por Rol"
        currentFilter={roleFilter}
        onFilterChange={setRoleFilter}
        filterOptions={[
          { label: 'Todos los roles', value: 'ALL' },
          { label: 'SUPERADMIN', value: 'SUPERADMIN' },
          { label: 'CLIENT', value: 'CLIENT' },
          { label: 'CUSTOMER', value: 'CUSTOMER' },
        ]}
        secondaryFilterLabel="Filtrar por Estado"
        currentSecondaryFilter={statusFilter}
        onSecondaryFilterChange={setStatusFilter}
        secondaryFilterOptions={[
          { label: 'Todos los estados', value: 'ALL' },
          { label: 'ACTIVE', value: 'ACTIVE' },
          { label: 'SUSPENDED', value: 'SUSPENDED' },
          { label: 'PENDING', value: 'PENDING' },
        ]}
      />

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#DDDDDD] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] mb-4">Crear Nuevo Usuario</h3>
            {formError && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Nombre Completo" required>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  placeholder="Ej: Laura Martínez"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Correo Electrónico" required>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  placeholder="laura@cliente.com"
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <FormField label="Rol Asignado" required>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                >
                  <option value="CLIENT">CLIENT (Cliente SaaS de FenixCMS)</option>
                  <option value="SUPERADMIN">SUPERADMIN (Administración Técnica)</option>
                  <option value="CUSTOMER">CUSTOMER (Comprador de Tienda)</option>
                </select>
              </FormField>

              <FormField label="Contraseña Inicial" required>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs border border-[#DDDDDD] rounded focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </FormField>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs border border-[#DDDDDD] rounded hover:bg-neutral-100"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded bg-[#D71920] hover:bg-[#A81218] text-white shadow-xs"
                >
                  {t('action.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperadminLayout>
  );
}
