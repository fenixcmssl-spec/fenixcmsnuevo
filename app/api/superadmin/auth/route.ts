import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/passwords';
import {
  createSession,
  getSessionUser,
  setSessionCookie,
  clearSessionCookie,
  destroySession,
  parseCookies,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Server-side Rate Limiting (5 attempts per 15 min per IP)
    const rateCheck = checkRateLimit(`login_ip:${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Demasiados intentos de inicio de sesión. Por favor, espere ${rateCheck.retryAfterSeconds} segundos.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Database connectivity check (Controlled errors, no silent mock fallback)
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'El servicio de base de datos PostgreSQL no está disponible.',
          },
        },
        { status: 503 }
      );
    }

    // 3. User Lookup
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Uniform error prevents user enumeration
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
        { status: 401 }
      );
    }

    // 4. Strict Password Verification (bcrypt compare only, no backdoors)
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN_FAILED',
          resource: 'User',
          resourceId: user.id,
          details: JSON.stringify({ reason: 'INVALID_CREDENTIALS' }),
          ipAddress: ip,
        },
      }).catch(() => {});

      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
        { status: 401 }
      );
    }

    // 5. Role and Account Status Check
    if (user.role !== 'SUPERADMIN' || user.status !== 'ACTIVE') {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN_FORBIDDEN',
          resource: 'User',
          resourceId: user.id,
          details: JSON.stringify({ reason: 'NOT_SUPERADMIN_OR_INACTIVE', role: user.role, status: user.status }),
          ipAddress: ip,
        },
      }).catch(() => {});

      return NextResponse.json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Acceso restringido a superadministradores activos.' } },
        { status: 403 }
      );
    }

    // 6. Reset Rate Limiter on Successful Auth
    resetRateLimit(`login_ip:${ip}`);

    // 7. Update Last Login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 8. Create Persistent Session with SHA-256 Token Hash
    const rawToken = await createSession(user.id, req);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_SUCCESS',
        resource: 'User',
        resourceId: user.id,
        details: JSON.stringify({ role: user.role }),
        ipAddress: ip,
      },
    }).catch(() => {});

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

    setSessionCookie(response, rawToken);
    return response;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error interno al procesar inicio de sesión.' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado.' } },
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
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al verificar sesión.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ ok: true, data: { message: 'Sesión cerrada correctamente.' } });
    clearSessionCookie(response);
    return response;
  } catch {
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  }
}
