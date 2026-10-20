import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    let list = repo.discounts;
    if (type && type !== 'ALL') {
      list = list.filter(d => d.type === type);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar descuentos.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { code, name, type = 'PERCENTAGE', value, appliesTo = 'ALL', maxUses = 100 } = body;

    if (!code || !name || value === undefined) {
      return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Código, nombre y valor son requeridos.' } }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (repo.discounts.some(d => d.code === cleanCode)) {
      return NextResponse.json({ ok: false, error: { code: 'DISCOUNT_EXISTS', message: 'El código de descuento ya existe.' } }, { status: 409 });
    }

    const newDiscount = {
      id: `disc_${Date.now()}`,
      code: cleanCode,
      name,
      type,
      value: Number(value),
      appliesTo,
      startDate: new Date().toISOString(),
      endDate: null,
      maxUses: Number(maxUses),
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    repo.discounts.push(newDiscount);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'DISCOUNT_CREATED', 'Discount', newDiscount.id, { code: newDiscount.code, value: newDiscount.value });

    return NextResponse.json({ ok: true, data: newDiscount });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al crear descuento.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, isActive, name, value } = body;

    const discount = repo.discounts.find(d => d.id === id);
    if (!discount) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Descuento no encontrado.' } }, { status: 404 });
    }

    if (isActive !== undefined) discount.isActive = Boolean(isActive);
    if (name) discount.name = name;
    if (value !== undefined) discount.value = Number(value);

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'DISCOUNT_UPDATED', 'Discount', discount.id, { code: discount.code, isActive: discount.isActive });

    return NextResponse.json({ ok: true, data: discount });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar descuento.' } }, { status: 500 });
  }
}
