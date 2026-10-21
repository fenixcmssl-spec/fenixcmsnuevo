import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { PlanStatus, Prisma } from '@prisma/client';

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

    const whereClause: Prisma.PlanWhereInput = {};
    if (status && status !== 'ALL' && Object.values(PlanStatus).includes(status as PlanStatus)) {
      whereClause.status = status as PlanStatus;
    }

    const plans = await prisma.plan.findMany({
      where: whereClause,
      include: {
        planModules: {
          include: {
            module: true,
          },
        },
        modulePrices: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const data = plans.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      isCustom: p.isCustom,
      status: p.status,
      modules: p.planModules.map(pm => pm.module.code),
      prices: p.modulePrices.map(pr => ({
        id: pr.id,
        targetType: 'PLAN',
        targetCode: p.code,
        billingCycle: pr.billingCycle,
        price: Number(pr.price),
        currency: pr.currency,
        isActive: pr.isActive,
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar planes.' } },
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
    const { code, name, description = '', modules = [], isCustom = false } = body;

    if (!code || !name) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Código y nombre son requeridos.' } },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const existing = await prisma.plan.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: 'PLAN_EXISTS', message: 'Ya existe un plan con este código.' } },
        { status: 409 }
      );
    }

    const newPlan = await prisma.plan.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        description: description.trim(),
        isCustom: Boolean(isCustom),
        status: PlanStatus.ACTIVE,
      },
    });

    // Link modules if provided
    if (Array.isArray(modules) && modules.length > 0) {
      const dbModules = await prisma.moduleDefinition.findMany({
        where: { code: { in: modules } },
      });
      for (const m of dbModules) {
        await prisma.planModule.create({
          data: {
            planId: newPlan.id,
            moduleId: m.id,
          },
        }).catch(() => {});
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'PLAN_CREATED',
        resource: 'Plan',
        resourceId: newPlan.id,
        details: JSON.stringify({ code: newPlan.code, name: newPlan.name }),
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      data: {
        id: newPlan.id,
        code: newPlan.code,
        name: newPlan.name,
        description: newPlan.description,
        isCustom: newPlan.isCustom,
        status: newPlan.status,
        modules,
        prices: [],
        createdAt: newPlan.createdAt.toISOString(),
        updatedAt: newPlan.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al crear plan.' } },
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
    const { id, status, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_ID', message: 'Identificador de plan requerido.' } },
        { status: 400 }
      );
    }

    const updateData: Prisma.PlanUpdateInput = {};
    if (status && Object.values(PlanStatus).includes(status as PlanStatus)) {
      updateData.status = status as PlanStatus;
    }
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updated = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'PLAN_UPDATED',
        resource: 'Plan',
        resourceId: updated.id,
        details: JSON.stringify(updateData),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar plan.' } },
      { status: 500 }
    );
  }
}
