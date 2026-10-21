import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { requireSuperadmin } from '@/lib/auth/session';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/passwords';
import { UserRole, AccountStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    const whereClause: {
      role?: UserRole;
      status?: AccountStatus;
    } = {};

    if (role && role !== 'ALL' && Object.values(UserRole).includes(role as UserRole)) {
      whereClause.role = role as UserRole;
    }

    if (status && status !== 'ALL' && Object.values(AccountStatus).includes(status as AccountStatus)) {
      whereClause.status = status as AccountStatus;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        mustChangePassword: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ok: true, data: users });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al listar usuarios.' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, name, role = 'CLIENT', password, mustChangePassword = true } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Faltan campos requeridos.' } },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        { ok: false, error: { code: 'WEAK_PASSWORD', message: strength.error } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: 'USER_EXISTS', message: 'Ya existe un usuario con este correo electrónico.' } },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = Object.values(UserRole).includes(role as UserRole)
      ? (role as UserRole)
      : UserRole.CLIENT;

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        role: assignedRole,
        passwordHash: hashedPassword,
        mustChangePassword: Boolean(mustChangePassword),
        status: AccountStatus.ACTIVE,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'USER_CREATED',
        resource: 'User',
        resourceId: newUser.id,
        details: JSON.stringify({ email: newUser.email, role: newUser.role }),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: newUser });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al registrar usuario.' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireSuperadmin(req);
    if (authCheck instanceof Response) return authCheck;
    const { user: currentSuperadmin } = authCheck;

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { id, status, role } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_ID', message: 'Identificador de usuario requerido.' } },
        { status: 400 }
      );
    }

    const updateData: {
      status?: AccountStatus;
      role?: UserRole;
    } = {};

    if (status && Object.values(AccountStatus).includes(status as AccountStatus)) {
      updateData.status = status as AccountStatus;
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      updateData.role = role as UserRole;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentSuperadmin.id,
        userEmail: currentSuperadmin.email,
        action: 'USER_UPDATED',
        resource: 'User',
        resourceId: id,
        details: JSON.stringify(updateData),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true, data: updatedUser });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al actualizar usuario.' } },
      { status: 500 }
    );
  }
}
