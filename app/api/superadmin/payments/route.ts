import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let list = repo.payments;
    if (status && status !== 'ALL') {
      list = list.filter(p => p.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar pagos.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { tenantId, amount, provider = 'MANUAL', transactionId } = body;

    const tenant = repo.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Tenant no encontrado.' } }, { status: 404 });
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      subscriptionId: null,
      amount: Number(amount),
      currency: 'EUR',
      status: 'SUCCEEDED' as const,
      provider,
      transactionId: transactionId || `manual_tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    repo.payments.unshift(newPayment);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PAYMENT_RECORDED', 'Payment', newPayment.id, { amount: newPayment.amount, tenantId: tenant.id });

    return NextResponse.json({ ok: true, data: newPayment });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar pago.' } }, { status: 500 });
  }
}
