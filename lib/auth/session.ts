import { NextResponse } from 'next/server';
import { repo, UserEntity } from '../db/repository';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'fenix_session_token';

export async function createSession(userId: string, req?: Request): Promise<string> {
  const token = 'fenix_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
  const userAgent = req?.headers.get('user-agent') || undefined;

  // Revoke existing sessions for strict hygiene or keep active
  repo.sessions.push({
    id: `ses_${Date.now()}`,
    token,
    userId,
    expiresAt,
    userAgent,
    createdAt: new Date().toISOString(),
  });

  return token;
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    })
  );
}

export async function getSessionUser(req: Request): Promise<UserEntity | null> {
  const cookieHeader = req.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) return null;

  const session = repo.sessions.find(s => s.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    // expired
    repo.sessions = repo.sessions.filter(s => s.token !== token);
    return null;
  }

  const user = repo.users.find(u => u.id === session.userId);
  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
}

export async function requireSuperadmin(req: Request): Promise<{ user: UserEntity } | Response> {
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

  return { user };
}

export async function destroySession(token: string): Promise<void> {
  repo.sessions = repo.sessions.filter(s => s.token !== token);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
