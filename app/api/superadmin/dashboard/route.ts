import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const totalTenants = repo.tenants.length;
    const activeTenants = repo.tenants.filter(t => t.status === 'ACTIVE').length;
    const activeSubscriptions = repo.subscriptions.filter(s => s.status === 'ACTIVE').length;

    // Calculate real MRR from active subscriptions
    let mrr = 0;
    for (const sub of repo.subscriptions) {
      if (sub.status === 'ACTIVE') {
        if (sub.billingCycle === 'MONTHLY') mrr += sub.price;
        else if (sub.billingCycle === 'QUARTERLY') mrr += sub.price / 3;
        else if (sub.billingCycle === 'SEMIANNUAL') mrr += sub.price / 6;
        else if (sub.billingCycle === 'ANNUAL') mrr += sub.price / 12;
      }
    }

    const activeLicenses = repo.licenses.filter(l => l.status === 'ACTIVE').length;
    const totalUsers = repo.users.length;
    const totalPaymentsVolume = repo.payments
      .filter(p => p.status === 'SUCCEEDED')
      .reduce((acc, p) => acc + p.amount, 0);

    // Module usage counts
    const moduleUsage: Record<string, number> = {};
    for (const mod of repo.modules) {
      moduleUsage[mod.code] = 0;
    }
    for (const t of repo.tenants) {
      for (const m of t.authorizedModules) {
        moduleUsage[m] = (moduleUsage[m] || 0) + 1;
      }
    }

    const recentTenants = repo.tenants.slice(0, 5);
    const recentAudit = repo.auditLogs.slice(0, 8);

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
          totalPaymentsVolume,
          systemHealth: 'OPERATIONAL',
        },
        moduleUsage,
        recentTenants,
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
