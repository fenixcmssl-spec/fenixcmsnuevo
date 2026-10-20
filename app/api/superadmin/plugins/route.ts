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

    let list = repo.plugins;
    if (category && category !== 'ALL') {
      list = list.filter(p => p.category === category);
    }
    if (status && status !== 'ALL') {
      list = list.filter(p => p.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar plugins.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, version } = body;

    const plugin = repo.plugins.find(p => p.id === id);
    if (!plugin) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Plugin no encontrado.' } }, { status: 404 });
    }

    if (status) plugin.status = status;
    if (version) plugin.version = version;
    plugin.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'PLUGIN_UPDATED', 'Plugin', plugin.id, { slug: plugin.slug, status: plugin.status });

    return NextResponse.json({ ok: true, data: plugin });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar plugin.' } }, { status: 500 });
  }
}
