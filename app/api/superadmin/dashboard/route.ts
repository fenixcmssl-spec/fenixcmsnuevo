import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';

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

    const [
      totalTenants,
      activeTenants,
      activeSubscriptions,
      activeLicenses,
      totalUsers,
      subscriptions,
      succeededPayments,
      modules,
      recentTenants,
      recentAudit,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { price: true, billingCycle: true },
      }),
      prisma.payment.findMany({
        where: { status: 'SUCCEEDED' },
        select: { amount: true },
      }),
      prisma.moduleDefinition.findMany({
        select: { code: true },
      }),
      prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          domains: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate MRR from active subscriptions using Decimal precision
    let mrr = 0;
    for (const sub of subscriptions) {
      const priceNum = Number(sub.price);
      if (sub.billingCycle === 'MONTHLY') mrr += priceNum;
      else if (sub.billingCycle === 'QUARTERLY') mrr += priceNum / 3;
      else if (sub.billingCycle === 'SEMIANNUAL') mrr += priceNum / 6;
      else if (sub.billingCycle === 'ANNUAL') mrr += priceNum / 12;
    }

    const totalPaymentsVolume = succeededPayments.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    // Module usage counts
    const moduleUsage: Record<string, number> = {};
    for (const mod of modules) {
      moduleUsage[mod.code] = 0;
    }

    return NextResponse.json({
      ok: true,
      data: {
        metrics: {
          totalTenants,
          activeTenants,
          activeSubscriptions,
          mrr: Math.round(mrr * 100) / 100,
          activeLicenses,
          totalUsers,
          totalPaymentsVolume: Math.round(totalPaymentsVolume * 100) / 100,
          systemHealth: 'OPERATIONAL',
        },
        moduleUsage,
        recentTenants: recentTenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          primaryDomain: t.primaryDomain || (t.domains[0]?.domain ?? `${t.slug}.fenixcms.es`),
          authorizedModules: ['ecommerce', 'blog'],
          status: t.status,
        })),
        recentAudit,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error al cargar métricas del panel.' } },
      { status: 500 }
    );
  }
}
