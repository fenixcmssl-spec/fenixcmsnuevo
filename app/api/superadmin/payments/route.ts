import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { PaymentStatus, Prisma } from '@prisma/client';

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

    const whereClause: Prisma.PaymentWhereInput = {};
    if (status && status !== 'ALL' && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      whereClause.status = status as PaymentStatus;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = payments.map(p => ({
      id: p.id,
      tenantId: p.tenantId,
      tenantName: p.tenant?.name || 'N/A',
      subscriptionId: p.subscriptionId,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      transactionId: p.transactionId,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar pagos.' } },
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
    const { tenantId, amount, provider = 'MANUAL', transactionId } = body;

    if (!tenantId || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Identificador de tenant e importe requeridos.' } },
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

    const decimalAmount = new Prisma.Decimal(amount);
    const newPayment = await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        amount: decimalAmount,
        currency: 'EUR',
        status: PaymentStatus.SUCCEEDED,
        provider,
        transactionId: transactionId || `manual_tx_${Date.now()}`,
      },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'PAYMENT_RECORDED',
        resource: 'Payment',
        resourceId: newPayment.id,
        details: JSON.stringify({ amount: Number(newPayment.amount), tenantId: tenant.id }),
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      data: {
        id: newPayment.id,
        tenantId: newPayment.tenantId,
        tenantName: newPayment.tenant.name,
        amount: Number(newPayment.amount),
        currency: newPayment.currency,
        status: newPayment.status,
        provider: newPayment.provider,
        transactionId: newPayment.transactionId,
        createdAt: newPayment.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar pago.' } },
      { status: 500 }
    );
  }
}
