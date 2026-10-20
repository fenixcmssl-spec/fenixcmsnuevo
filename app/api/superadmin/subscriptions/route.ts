import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let list = repo.subscriptions.map(s => {
      const tenant = repo.tenants.find(t => t.id === s.tenantId);
      const plan = repo.plans.find(p => p.id === s.planId || p.code === s.planCode);
      return {
        ...s,
        tenantName: tenant?.name || 'N/A',
        tenantSlug: tenant?.slug || 'N/A',
        planName: plan?.name || s.planCode || 'Personalizado',
      };
    });

    if (status && status !== 'ALL') {
      list = list.filter(s => s.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar suscripciones.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, billingCycle, price } = body;

    const sub = repo.subscriptions.find(s => s.id === id);
    if (!sub) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Suscripción no encontrada.' } }, { status: 404 });
    }

    if (status) sub.status = status;
    if (billingCycle) sub.billingCycle = billingCycle;
    if (price !== undefined) sub.price = Number(price);
    sub.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'SUBSCRIPTION_UPDATED', 'Subscription', sub.id, { status: sub.status, price: sub.price });

    return NextResponse.json({ ok: true, data: sub });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar suscripción.' } }, { status: 500 });
  }
}
