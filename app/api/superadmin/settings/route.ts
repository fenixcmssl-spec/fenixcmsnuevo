import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    return NextResponse.json({ ok: true, data: repo.settings });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al obtener configuraciones.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { key, value } = body;

    const setting = repo.settings.find(s => s.key === key);
    if (!setting) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Configuración no encontrada.' } }, { status: 404 });
    }

    setting.value = String(value);
    setting.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'SETTING_UPDATED', 'PlatformSetting', setting.id, { key, value });

    return NextResponse.json({ ok: true, data: setting });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar configuración.' } }, { status: 500 });
  }
}
