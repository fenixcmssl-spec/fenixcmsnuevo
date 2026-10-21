import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth/passwords';
import { requireSuperadmin } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user } = authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_FIELDS', message: 'Todos los campos son obligatorios.' } },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: { code: 'PASSWORDS_MISMATCH', message: 'La nueva contraseña y su confirmación no coinciden.' } },
        { status: 400 }
      );
    }

    // Retrieve fresh user record from PostgreSQL
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { ok: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' } },
        { status: 404 }
      );
    }

    // 1. Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'PASSWORD_CHANGE_FAILED',
          resource: 'User',
          resourceId: user.id,
          details: JSON.stringify({ reason: 'CURRENT_PASSWORD_INCORRECT' }),
        },
      }).catch(() => {});

      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CURRENT_PASSWORD', message: 'La contraseña actual no es correcta.' } },
        { status: 400 }
      );
    }

    // 2. Prevent immediate password reuse
    const isReused = await verifyPassword(newPassword, dbUser.passwordHash);
    if (isReused) {
      return NextResponse.json(
        { ok: false, error: { code: 'PASSWORD_REUSED', message: 'La nueva contraseña no puede ser igual a la anterior.' } },
        { status: 400 }
      );
    }

    // 3. Validate password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return NextResponse.json(
        { ok: false, error: { code: 'WEAK_PASSWORD', message: strengthCheck.error } },
        { status: 400 }
      );
    }

    // 4. Hash and persist in PostgreSQL
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    // 5. Audit log without sensitive payload
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'PASSWORD_CHANGED',
        resource: 'User',
        resourceId: user.id,
        details: JSON.stringify({ status: 'SUCCESS' }),
      },
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      data: { message: 'Contraseña actualizada con éxito.' },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno al actualizar la contraseña.' } },
      { status: 500 }
    );
  }
}
