import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma, checkDatabaseHealth } from '../db/prisma';

export const SESSION_COOKIE_NAME = 'fenix_session_token';
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
}

/**
 * Computes a secure SHA-256 hash of a session or reset token.
 * We store ONLY the hash in the database to prevent token theft in DB leaks.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a cryptographically strong 32-byte session token.
 */
export function generateRawToken(): string {
  return 'fnx_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Parses cookies from header.
 */
export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    })
  );
}

/**
 * Creates a persistent session in PostgreSQL for the given user ID.
 * Returns the raw token to be set in the HttpOnly cookie.
 */
export async function createSession(userId: string, req?: Request): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (req) {
    ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      null;
    userAgent = req.headers.get('user-agent') || null;
  }

  const health = await checkDatabaseHealth();
  if (health.isHealthy) {
    await prisma.session.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  return rawToken;
}

/**
 * Validates session token from request cookies against PostgreSQL.
 * Verifies expiration, user status, and token hash.
 */
export async function getSessionUser(req: Request): Promise<SessionUserData | null> {
  const cookieHeader = req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const health = await checkDatabaseHealth();

  if (health.isHealthy) {
    try {
      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: {
          user: true,
        },
      });

      if (!session) {
        return null;
      }

      // Check server-side expiration
      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }

      // Check account status
      if (!session.user || session.user.status !== 'ACTIVE') {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        status: session.user.status,
        mustChangePassword: session.user.mustChangePassword,
        emailVerified: session.user.emailVerified,
        lastLoginAt: session.user.lastLoginAt,
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Middleware helper for Superadmin-only endpoints.
 * Enforces authentication, role verification, and password change requirement.
 */
export async function requireSuperadmin(
  req: Request
): Promise<{ user: SessionUserData } | Response> {
  // Basic CSRF mitigation on state-changing requests
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { ok: false, error: { code: 'CSRF_REJECTED', message: 'Petición rechazada por validación de origen.' } },
            { status: 403 }
          );
        }
      } catch {
        // Ignored if URL parsing fails
      }
    }
  }

  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado o sesión expirada.' } },
      { status: 401 }
    );
  }

  if (user.role !== 'SUPERADMIN') {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Acceso restringido a superadministradores.' } },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  // If user must change password, force them to change it before accessing any other endpoint
  if (
    user.mustChangePassword &&
    !url.pathname.includes('/api/superadmin/password') &&
    !url.pathname.includes('/api/superadmin/auth')
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'MUST_CHANGE_PASSWORD',
          message: 'Debe actualizar su contraseña antes de continuar.',
        },
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Revokes a session persistently in PostgreSQL.
 */
export async function destroySession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);

  const health = await checkDatabaseHealth();
  if (health.isHealthy) {
    try {
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    } catch {
      // Ignored if already removed
    }
  }
}

/**
 * Sets secure HttpOnly cookie for session token.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });
}

/**
 * Clears the session cookie.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
