import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth/passwords';
import { requireSuperadmin } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user } = authCheck;

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

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      repo.logAudit(user.id, user.email, 'PASSWORD_CHANGE_FAILED', 'User', user.id, { reason: 'CURRENT_PASSWORD_INCORRECT' });
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CURRENT_PASSWORD', message: 'La contraseña actual no es correcta.' } },
        { status: 400 }
      );
    }

    // Prevent immediate reuse
    const isReused = await verifyPassword(newPassword, user.passwordHash);
    if (isReused) {
      return NextResponse.json(
        { ok: false, error: { code: 'PASSWORD_REUSED', message: 'La nueva contraseña no puede ser igual a la anterior.' } },
        { status: 400 }
      );
    }

    // Validate strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return NextResponse.json(
        { ok: false, error: { code: 'WEAK_PASSWORD', message: strengthCheck.error } },
        { status: 400 }
      );
    }

    // Hash and save
    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    user.mustChangePassword = false;
    user.updatedAt = new Date().toISOString();

    repo.logAudit(user.id, user.email, 'PASSWORD_CHANGED', 'User', user.id, { status: 'SUCCESS' });

    return NextResponse.json({
      ok: true,
      message: 'Contraseña actualizada con éxito.',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno al actualizar la contraseña.' } },
      { status: 500 }
    );
  }
}
