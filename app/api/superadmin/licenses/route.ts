import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let list = repo.licenses;
    if (status && status !== 'ALL') {
      list = list.filter(l => l.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar licencias.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { tenantId, maxDomains = 3, maxTenants = 1 } = body;

    const tenant = repo.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Tenant no encontrado.' } }, { status: 404 });
    }

    const key = `FNX-LIC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLicense = {
      id: `lic_${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      licenseKey: key,
      status: 'ACTIVE' as const,
      maxTenants: Number(maxTenants),
      maxDomains: Number(maxDomains),
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activationsCount: 1,
      updatedAt: new Date().toISOString(),
    };

    repo.licenses.unshift(newLicense);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'LICENSE_ISSUED', 'License', newLicense.id, { key: newLicense.licenseKey, tenantId: tenant.id });

    return NextResponse.json({ ok: true, data: newLicense });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al emitir licencia.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, maxDomains } = body;

    const license = repo.licenses.find(l => l.id === id);
    if (!license) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Licencia no encontrada.' } }, { status: 404 });
    }

    if (status) license.status = status;
    if (maxDomains !== undefined) license.maxDomains = Number(maxDomains);
    license.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'LICENSE_UPDATED', 'License', license.id, { status: license.status });

    return NextResponse.json({ ok: true, data: license });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar licencia.' } }, { status: 500 });
  }
}
