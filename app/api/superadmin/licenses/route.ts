import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { LicenseStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const whereClause: Prisma.LicenseWhereInput = {};
    if (status && status !== 'ALL' && Object.values(LicenseStatus).includes(status as LicenseStatus)) {
      whereClause.status = status as LicenseStatus;
    }

    const licenses = await prisma.license.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: { id: true, name: true, slug: true },
        },
        activations: true,
      },
      orderBy: { issuedAt: 'desc' },
    });

    const data = licenses.map(l => ({
      id: l.id,
      tenantId: l.tenantId,
      tenantName: l.tenant?.name || 'N/A',
      tenantSlug: l.tenant?.slug || 'N/A',
      licenseKey: l.licenseKey,
      status: l.status,
      maxTenants: l.maxTenants,
      maxDomains: l.maxDomains,
      issuedAt: l.issuedAt.toISOString(),
      expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
      activationsCount: l.activations.length,
      updatedAt: l.updatedAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar licencias.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { tenantId, maxDomains = 3, maxTenants = 1 } = body;

    if (!tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Identificador de tenant requerido.' } },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Tenant no encontrado.' } },
        { status: 404 }
      );
    }

    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const key = `FNX-LIC-${Date.now().toString(36).toUpperCase()}-${randomSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLicense = await prisma.license.create({
      data: {
        tenantId: tenant.id,
        licenseKey: key,
        status: LicenseStatus.ACTIVE,
        maxTenants: Number(maxTenants),
        maxDomains: Number(maxDomains),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'LICENSE_ISSUED',
        resource: 'License',
        resourceId: newLicense.id,
        details: JSON.stringify({ key: newLicense.licenseKey, tenantId: tenant.id }),
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      data: {
        id: newLicense.id,
        tenantId: newLicense.tenantId,
        tenantName: newLicense.tenant.name,
        licenseKey: newLicense.licenseKey,
        status: newLicense.status,
        maxTenants: newLicense.maxTenants,
        maxDomains: newLicense.maxDomains,
        issuedAt: newLicense.issuedAt.toISOString(),
        expiresAt: newLicense.expiresAt ? newLicense.expiresAt.toISOString() : null,
        activationsCount: 0,
        updatedAt: newLicense.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al emitir licencia.' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { id, status, maxDomains } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_ID', message: 'Identificador de licencia requerido.' } },
        { status: 400 }
      );
    }

    const updateData: Prisma.LicenseUpdateInput = {};
    if (status && Object.values(LicenseStatus).includes(status as LicenseStatus)) {
      updateData.status = status as LicenseStatus;
    }
    if (maxDomains !== undefined && !isNaN(Number(maxDomains))) {
      updateData.maxDomains = Number(maxDomains);
    }

    const updated = await prisma.license.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'LICENSE_UPDATED',
        resource: 'License',
        resourceId: updated.id,
        details: JSON.stringify(updateData),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar licencia.' } },
      { status: 500 }
    );
  }
}
