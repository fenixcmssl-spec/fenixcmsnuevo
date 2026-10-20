import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let list = repo.tenants.map(t => {
      const domains = repo.tenantDomains.filter(d => d.tenantId === t.id);
      const owner = repo.users.find(u => u.id === t.ownerId);
      return {
        ...t,
        domains,
        ownerEmail: owner?.email || 'N/A',
        ownerName: owner?.name || 'N/A',
      };
    });

    if (status && status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar tenants.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { name, slug, ownerEmail, primaryDomain, defaultLocale = 'es', authorizedModules = ['ecommerce', 'blog'] } = body;

    if (!name || !slug || !ownerEmail) {
      return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Nombre, slug y correo del propietario son requeridos.' } }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (repo.tenants.some(t => t.slug === cleanSlug)) {
      return NextResponse.json({ ok: false, error: { code: 'SLUG_EXISTS', message: 'El slug ya está en uso por otro tenant.' } }, { status: 409 });
    }

    // Check or create owner
    let owner = repo.users.find(u => u.email.toLowerCase() === ownerEmail.trim().toLowerCase());
    if (!owner) {
      owner = {
        id: `usr_${Date.now()}`,
        email: ownerEmail.trim().toLowerCase(),
        passwordHash: '$2a$10$wT0lq7x5rGz6eH1xO.8YwOhW446gWwV6f5o1P8.F6zQ8pP.uI1Riy',
        name: name + ' Admin',
        role: 'CLIENT',
        status: 'ACTIVE',
        mustChangePassword: true,
        emailVerified: true,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      repo.users.push(owner);
    }

    const now = new Date().toISOString();
    const tenantId = `ten_${Date.now()}`;
    const newTenant = {
      id: tenantId,
      name,
      slug: cleanSlug,
      ownerId: owner.id,
      status: 'ACTIVE' as const,
      defaultLocale,
      primaryDomain: primaryDomain || `${cleanSlug}.fenixcms.es`,
      authorizedModules,
      createdAt: now,
      updatedAt: now,
    };

    repo.tenants.unshift(newTenant);

    if (newTenant.primaryDomain) {
      repo.tenantDomains.push({
        id: `dom_${Date.now()}`,
        tenantId: newTenant.id,
        domain: newTenant.primaryDomain,
        status: 'VERIFIED',
        isPrimary: true,
        sslStatus: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create starter subscription
    repo.subscriptions.unshift({
      id: `sub_${Date.now()}`,
      tenantId: newTenant.id,
      planId: 'plan_pro_ecommerce',
      planCode: 'pro_ecommerce',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      billingCycle: 'MONTHLY',
      price: 49.0,
      currency: 'EUR',
      modules: authorizedModules,
      createdAt: now,
      updatedAt: now,
    });

    // Create license
    repo.licenses.unshift({
      id: `lic_${Date.now()}`,
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      licenseKey: `FNX-STD-2026-${cleanSlug.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'ACTIVE',
      maxTenants: 1,
      maxDomains: 3,
      issuedAt: now,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activationsCount: 1,
      updatedAt: now,
    });

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'TENANT_CREATED', 'Tenant', newTenant.id, { slug: newTenant.slug, name: newTenant.name });

    return NextResponse.json({ ok: true, data: newTenant });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar tenant.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, name, defaultLocale, authorizedModules } = body;

    const tenant = repo.tenants.find(t => t.id === id);
    if (!tenant) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Tenant no encontrado.' } }, { status: 404 });
    }

    if (status) tenant.status = status;
    if (name) tenant.name = name;
    if (defaultLocale) tenant.defaultLocale = defaultLocale;
    if (authorizedModules) tenant.authorizedModules = authorizedModules;
    tenant.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'TENANT_UPDATED', 'Tenant', tenant.id, { status, authorizedModules });

    return NextResponse.json({ ok: true, data: tenant });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar tenant.' } }, { status: 500 });
  }
}
