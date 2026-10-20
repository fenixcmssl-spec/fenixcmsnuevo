import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const cycle = url.searchParams.get('cycle');

    let list = repo.prices;
    if (cycle && cycle !== 'ALL') {
      list = list.filter(p => p.billingCycle === cycle);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar precios.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { targetType, targetCode, billingCycle, price, currency = 'EUR' } = body;

    if (!targetType || !targetCode || !billingCycle || price === undefined) {
      return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Faltan parámetros de tarifa.' } }, { status: 400 });
    }

    const newPrice = {
      id: `pr_${Date.now()}`,
      targetType,
      targetCode,
      billingCycle,
      price: Number(price),
      currency,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    repo.prices.push(newPrice);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PRICE_CREATED', 'Price', newPrice.id, { targetCode, billingCycle, price });

    return NextResponse.json({ ok: true, data: newPrice });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar precio.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, price, isActive } = body;

    const priceItem = repo.prices.find(p => p.id === id);
    if (!priceItem) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Tarifa no encontrada.' } }, { status: 404 });
    }

    if (price !== undefined) priceItem.price = Number(price);
    if (isActive !== undefined) priceItem.isActive = Boolean(isActive);

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PRICE_UPDATED', 'Price', priceItem.id, { price: priceItem.price, isActive: priceItem.isActive });

    return NextResponse.json({ ok: true, data: priceItem });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar precio.' } }, { status: 500 });
  }
}
