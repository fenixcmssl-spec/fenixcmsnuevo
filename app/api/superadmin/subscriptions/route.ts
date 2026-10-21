import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { SubscriptionStatus, BillingCycle, Prisma } from '@prisma/client';

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

    const whereClause: Prisma.SubscriptionWhereInput = {};
    if (status && status !== 'ALL' && Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
      whereClause.status = status as SubscriptionStatus;
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: { id: true, name: true, slug: true },
        },
        plan: {
          select: { id: true, name: true, code: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = subscriptions.map(s => ({
      id: s.id,
      tenantId: s.tenantId,
      tenantName: s.tenant?.name || 'N/A',
      tenantSlug: s.tenant?.slug || 'N/A',
      planId: s.planId,
      planCode: s.plan?.code || null,
      planName: s.plan?.name || 'Personalizado',
      status: s.status,
      currentPeriodStart: s.currentPeriodStart.toISOString(),
      currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      billingCycle: s.billingCycle,
      price: Number(s.price),
      currency: s.currency,
      modules: s.items.map(i => i.moduleCode),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar suscripciones.' } },
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
    const { id, status, billingCycle, price } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_ID', message: 'Identificador de suscripción requerido.' } },
        { status: 400 }
      );
    }

    const updateData: Prisma.SubscriptionUpdateInput = {};
    if (status && Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
      updateData.status = status as SubscriptionStatus;
    }
    if (billingCycle && Object.values(BillingCycle).includes(billingCycle as BillingCycle)) {
      updateData.billingCycle = billingCycle as BillingCycle;
    }
    if (price !== undefined && !isNaN(Number(price))) {
      updateData.price = new Prisma.Decimal(price);
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'SUBSCRIPTION_UPDATED',
        resource: 'Subscription',
        resourceId: updated.id,
        details: JSON.stringify(updateData),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar suscripción.' } },
      { status: 500 }
    );
  }
}
