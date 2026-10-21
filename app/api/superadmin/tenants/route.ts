import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { TenantStatus, UserRole, AccountStatus } from '@prisma/client';
import { hashPassword } from '@/lib/auth/passwords';
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

    const whereClause: {
      status?: TenantStatus;
    } = {};

    if (status && status !== 'ALL' && Object.values(TenantStatus).includes(status as TenantStatus)) {
      whereClause.status = status as TenantStatus;
    }

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      include: {
        domains: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = tenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      defaultLocale: t.defaultLocale,
      primaryDomain: t.primaryDomain || t.domains.find(d => d.isPrimary)?.domain || `${t.slug}.fenixcms.es`,
      domains: t.domains,
      ownerEmail: t.owner?.email || 'N/A',
      ownerName: t.owner?.name || 'N/A',
      authorizedModules: ['ecommerce', 'blog'],
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar tenants.' } },
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
    const { name, slug, ownerEmail, primaryDomain, defaultLocale = 'es' } = body;

    if (!name || !slug || !ownerEmail) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Nombre, slug y correo del propietario son requeridos.' } },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();

    // Check slug uniqueness
    const existingSlug = await prisma.tenant.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { ok: false, error: { code: 'SLUG_EXISTS', message: 'El slug ya está en uso por otro tenant.' } },
        { status: 409 }
      );
    }

    // Find or create owner user
    let owner = await prisma.user.findUnique({
      where: { email: normalizedOwnerEmail },
    });

    if (!owner) {
      const randomTempSecret = crypto.randomBytes(24).toString('base64') + '!A1*';
      const defaultHash = await hashPassword(randomTempSecret);
      owner = await prisma.user.create({
        data: {
          email: normalizedOwnerEmail,
          name: name.trim() + ' Admin',
          role: UserRole.CLIENT,
          status: AccountStatus.ACTIVE,
          passwordHash: defaultHash,
          mustChangePassword: true,
          emailVerified: false,
        },
      });
    }

    // Clean primary domain
    const cleanPrimaryDomain = primaryDomain
      ? primaryDomain.trim().toLowerCase().replace(/https?:\/\//, '').replace(/\/.*$/, '')
      : `${cleanSlug}.fenixcms.es`;

    // Create Tenant and primary TenantDomain in an atomic transaction
    const newTenant = await prisma.$transaction(async tx => {
      const created = await tx.tenant.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          ownerId: owner.id,
          status: TenantStatus.TRIAL,
          defaultLocale,
          primaryDomain: cleanPrimaryDomain,
          domains: {
            create: {
              domain: cleanPrimaryDomain,
              isPrimary: true,
              status: 'VERIFIED',
              sslStatus: 'ACTIVE',
            },
          },
        },
        include: {
          domains: true,
        },
      });

      return created;
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'TENANT_CREATED',
        resource: 'Tenant',
        resourceId: newTenant.id,
        details: JSON.stringify({ slug: cleanSlug, name, ownerEmail: normalizedOwnerEmail }),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: newTenant });
  } catch (error) {
    console.error('Create tenant error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar tenant.' } },
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
    const { id, status, name, defaultLocale } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_ID', message: 'Identificador de tenant requerido.' } },
        { status: 400 }
      );
    }

    const updateData: {
      status?: TenantStatus;
      name?: string;
      defaultLocale?: string;
    } = {};

    if (status && Object.values(TenantStatus).includes(status as TenantStatus)) {
      updateData.status = status as TenantStatus;
    }
    if (name) updateData.name = name.trim();
    if (defaultLocale) updateData.defaultLocale = defaultLocale;

    const updated = await prisma.tenant.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'TENANT_UPDATED',
        resource: 'Tenant',
        resourceId: id,
        details: JSON.stringify(updateData),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar tenant.' } },
      { status: 500 }
    );
  }
}
