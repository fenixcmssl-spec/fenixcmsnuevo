import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let list = repo.plans.map(p => {
      const planPrices = repo.prices.filter(pr => pr.targetType === 'PLAN' && pr.targetCode === p.code);
      return {
        ...p,
        prices: planPrices,
      };
    });

    if (status && status !== 'ALL') {
      list = list.filter(p => p.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar planes.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { code, name, description, modules = [], isCustom = false } = body;

    if (!code || !name) {
      return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Código y nombre son requeridos.' } }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (repo.plans.some(p => p.code === cleanCode)) {
      return NextResponse.json({ ok: false, error: { code: 'PLAN_EXISTS', message: 'Ya existe un plan con este código.' } }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newPlan = {
      id: `plan_${Date.now()}`,
      code: cleanCode,
      name,
      description: description || '',
      isCustom,
      status: 'ACTIVE' as const,
      modules,
      createdAt: now,
      updatedAt: now,
    };

    repo.plans.push(newPlan);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PLAN_CREATED', 'Plan', newPlan.id, { code: newPlan.code, modules });

    return NextResponse.json({ ok: true, data: newPlan });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al crear plan.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, name, description, modules } = body;

    const plan = repo.plans.find(p => p.id === id);
    if (!plan) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Plan no encontrado.' } }, { status: 404 });
    }

    if (status) plan.status = status;
    if (name) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (modules) plan.modules = modules;
    plan.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PLAN_UPDATED', 'Plan', plan.id, { code: plan.code, status: plan.status });

    return NextResponse.json({ ok: true, data: plan });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar plan.' } }, { status: 500 });
  }
}
