import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { verifyPassword } from '@/lib/auth/passwords';
import { createSession, getSessionUser, setSessionCookie, clearSessionCookie, parseCookies } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Correo y contraseña requeridos.' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = repo.users.find(u => u.email.toLowerCase() === normalizedEmail);

    // Constant-time check or uniform error to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      repo.logAudit(user.id, user.email, 'LOGIN_FAILED', 'User', user.id, { reason: 'WRONG_PASSWORD' });
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
        { status: 401 }
      );
    }

    if (user.role !== 'SUPERADMIN') {
      repo.logAudit(user.id, user.email, 'LOGIN_FORBIDDEN', 'User', user.id, { reason: 'NOT_SUPERADMIN' });
      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'No tiene privilegios de superadministrador.' } },
        { status: 403 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const token = await createSession(user.id, req);

    repo.logAudit(user.id, user.email, 'LOGIN_SUCCESS', 'User', user.id, { role: user.role });

    const response = NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno en el servidor.' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Sesión no iniciada.' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error al verificar sesión.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies['fenix_session_token'];

    if (token) {
      repo.sessions = repo.sessions.filter(s => s.token !== token);
    }

    const response = NextResponse.json({ ok: true, message: 'Sesión cerrada correctamente.' });
    clearSessionCookie(response);
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error al cerrar sesión.' } },
      { status: 500 }
    );
  }
}
