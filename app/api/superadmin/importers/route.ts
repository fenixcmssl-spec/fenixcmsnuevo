import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const platform = url.searchParams.get('platform');

    let list = repo.importers;
    if (platform && platform !== 'ALL') {
      list = list.filter(i => i.sourcePlatform === platform);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar importadores.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, version } = body;

    const importer = repo.importers.find(i => i.id === id);
    if (!importer) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Importador no encontrado.' } }, { status: 404 });
    }

    if (status) importer.status = status;
    if (version) importer.version = version;
    importer.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'IMPORTER_UPDATED', 'Importer', importer.id, { slug: importer.slug, status: importer.status });

    return NextResponse.json({ ok: true, data: importer });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar importador.' } }, { status: 500 });
  }
}
