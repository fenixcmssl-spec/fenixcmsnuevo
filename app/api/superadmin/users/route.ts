import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { requireSuperadmin } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/passwords';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    let list = repo.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      mustChangePassword: u.mustChangePassword,
      emailVerified: u.emailVerified,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    if (role && role !== 'ALL') {
      list = list.filter(u => u.role === role);
    }
    if (status && status !== 'ALL') {
      list = list.filter(u => u.status === status);
    }

    return NextResponse.json({ ok: true, data: list });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar usuarios.' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { email, name, role = 'CLIENT', password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Faltan campos requeridos.' } }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    if (repo.users.some(u => u.email.toLowerCase() === normalized)) {
      return NextResponse.json({ ok: false, error: { code: 'USER_EXISTS', message: 'Ya existe un usuario con este correo.' } }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const now = new Date().toISOString();
    const newUser = {
      id: `usr_${Date.now()}`,
      email: normalized,
      passwordHash: hashed,
      name,
      role,
      status: 'ACTIVE' as const,
      mustChangePassword: false,
      emailVerified: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    repo.users.unshift(newUser);
    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'USER_CREATED', 'User', newUser.id, { email: newUser.email, role: newUser.role });

    return NextResponse.json({
      ok: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al crear usuario.' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const body = await req.json();
    const { id, status, role, name } = body;

    const targetUser = repo.users.find(u => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Usuario no encontrado.' } }, { status: 404 });
    }

    // Protect against self-demotion or disabling last superadmin
    if (targetUser.id === currentSuperadmin.id && (status === 'SUSPENDED' || role !== 'SUPERADMIN')) {
      return NextResponse.json({ ok: false, error: { code: 'CANNOT_DEMOTE_SELF', message: 'No puedes degradar ni suspender tu propia cuenta activa.' } }, { status: 400 });
    }

    if (status) targetUser.status = status;
    if (role) targetUser.role = role;
    if (name) targetUser.name = name;
    targetUser.updatedAt = new Date().toISOString();

    repo.logAudit(currentSuperadmin.id, currentSuperadmin.email, 'USER_UPDATED', 'User', targetUser.id, { status, role });

    return NextResponse.json({ ok: true, data: targetUser });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar usuario.' } }, { status: 500 });
  }
}
