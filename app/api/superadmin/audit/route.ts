import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const resource = url.searchParams.get('resource');

    let list = repo.auditLogs;
    if (action && action !== 'ALL') {
      list = list.filter(a => a.action === action);
    }
    if (resource && resource !== 'ALL') {
      list = list.filter(a => a.resource === resource);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al consultar auditoría.' } }, { status: 500 });
  }
}
