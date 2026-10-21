import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const tenantParam = req.headers.get('x-tenant-id') || url.searchParams.get('tenantId');

    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    // Resolve tenant
    let tenantId = tenantParam;
    if (!tenantId) {
      const host = req.headers.get('host')?.split(':')[0]?.toLowerCase() || '';
      const domain = await prisma.tenantDomain.findFirst({
        where: { domain: host, status: { in: ['ACTIVE', 'VERIFIED'] } },
      });
      if (domain) {
        tenantId = domain.tenantId;
      } else {
        const firstTenant = await prisma.tenant.findFirst({
          where: { status: { in: ['ACTIVE', 'TRIAL'] } },
          orderBy: { createdAt: 'asc' },
        });
        tenantId = firstTenant?.id;
      }
    }

    const whereClause: {
      isActive: boolean;
      tenantId?: string;
      category?: string;
    } = { isActive: true };

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    const products = await prisma.storeProduct.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        category: p.category,
        imageUrl: p.imageUrl || '/public/favicon.ico',
        isActive: p.isActive,
      })),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error al consultar productos.' } },
      { status: 500 }
    );
  }
}
