import { prisma, checkDatabaseHealth } from '../lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '../lib/auth/passwords';

async function bootstrapSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Error: Se requieren las variables de entorno SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD.');
    process.exit(1);
  }

  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    console.error(`Error: Contraseña no cumple las políticas de seguridad: ${strength.error}`);
    process.exit(1);
  }

  const health = await checkDatabaseHealth();
  if (!health.isHealthy) {
    console.error(`Error: No se pudo conectar a PostgreSQL: ${health.error}`);
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.role === 'SUPERADMIN') {
        console.log(`El superadministrador (${email}) ya existe. Operación idempotente completada sin modificaciones.`);
        process.exit(0);
      } else {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'SUPERADMIN' },
        });
        console.log(`Rol SUPERADMIN asignado al usuario existente (${email}).`);
        process.exit(0);
      }
    }

    const passwordHash = await hashPassword(password);
    const superadmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: process.env.SUPERADMIN_NAME || 'Superadministrador Inicial',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        mustChangePassword: process.env.SUPERADMIN_MUST_CHANGE_PASSWORD === 'true',
        emailVerified: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: superadmin.id,
        userEmail: superadmin.email,
        action: 'SUPERADMIN_BOOTSTRAPPED',
        resource: 'User',
        resourceId: superadmin.id,
        details: JSON.stringify({ email: superadmin.email, method: 'CLI_BOOTSTRAP' }),
      },
    });

    console.log(`Superadministrador (${email}) creado exitosamente con privilegios mínimos y trazabilidad de auditoría.`);
  } catch (error) {
    console.error('Error al inicializar superadministrador:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapSuperadmin();
