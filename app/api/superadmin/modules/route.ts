import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');

    let list = repo.modules;
    if (category && category !== 'ALL') {
      list = list.filter(m => m.category === category);
    }
    if (status && status !== 'ALL') {
      list = list.filter(m => m.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar módulos.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, version, name, description } = body;

    const moduleItem = repo.modules.find(m => m.id === id);
    if (!moduleItem) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Módulo no encontrado.' } }, { status: 404 });
    }

    if (status) moduleItem.status = status;
    if (version) moduleItem.version = version;
    if (name) moduleItem.name = name;
    if (description) moduleItem.description = description;
    moduleItem.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'MODULE_UPDATED', 'Module', moduleItem.id, { code: moduleItem.code, status: moduleItem.status });

    return NextResponse.json({ ok: true, data: moduleItem });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar módulo.' } }, { status: 500 });
  }
}
