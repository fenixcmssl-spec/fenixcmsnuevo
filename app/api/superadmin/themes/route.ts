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

    let list = repo.themes;
    if (category && category !== 'ALL') {
      list = list.filter(t => t.category === category);
    }
    if (status && status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar temas.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, version } = body;

    const theme = repo.themes.find(t => t.id === id);
    if (!theme) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Tema no encontrado.' } }, { status: 404 });
    }

    if (status) theme.status = status;
    if (version) theme.version = version;
    theme.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'THEME_UPDATED', 'Theme', theme.id, { slug: theme.slug, status: theme.status });

    return NextResponse.json({ ok: true, data: theme });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar tema.' } }, { status: 500 });
  }
}
