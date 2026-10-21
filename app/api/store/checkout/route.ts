import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.isHealthy) {
      return NextResponse.json(
        { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Servicio de base de datos no disponible.' } },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      items,
      idempotencyKey: bodyIdempotencyKey,
    } = body;

    // 1. Validate Customer Information
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CUSTOMER_NAME', message: 'El nombre del cliente es obligatorio (mínimo 2 caracteres).' } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = (customerEmail || '').trim().toLowerCase();
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CUSTOMER_EMAIL', message: 'Correo electrónico del cliente no válido.' } },
        { status: 400 }
      );
    }

    // 2. Validate Items Array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'EMPTY_CART', message: 'La cesta de la compra no puede estar vacía.' } },
        { status: 400 }
      );
    }

    // 3. Resolve Tenant via Host Header, Custom Domain or Tenant ID parameter
    const hostHeader = req.headers.get('host')?.split(':')[0]?.toLowerCase() || '';
    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { primaryDomain: hostHeader },
          { domains: { some: { domain: hostHeader, status: { in: ['ACTIVE', 'VERIFIED'] } } } },
        ],
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
    });

    // If running in development / test preview on localhost, resolve fallback active tenant
    if (!tenant) {
      const tenantParam = req.headers.get('x-tenant-id') || body.tenantId;
      if (tenantParam) {
        tenant = await prisma.tenant.findUnique({
          where: { id: tenantParam },
        });
      }

      if (!tenant) {
        tenant = await prisma.tenant.findFirst({
          where: { status: { in: ['ACTIVE', 'TRIAL'] } },
          orderBy: { createdAt: 'asc' },
        });
      }
    }

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: { code: 'TENANT_NOT_FOUND', message: 'No se pudo resolver el comercio o tenant asociado.' } },
        { status: 404 }
      );
    }

    // 4. Idempotency Check (Prevents duplicate charges / duplicate order creation)
    const idempotencyKey =
      req.headers.get('idempotency-key') || bodyIdempotencyKey || null;

    if (idempotencyKey) {
      const existingOrder = await prisma.storeOrder.findUnique({
        where: { idempotencyKey },
        include: { items: true },
      });

      if (existingOrder) {
        return NextResponse.json({
          ok: true,
          data: {
            orderId: existingOrder.id,
            status: existingOrder.status,
            totalAmount: Number(existingOrder.totalAmount),
            currency: existingOrder.currency,
            isIdempotentReplay: true,
            message: 'Pedido recuperado de forma idempotente.',
          },
        });
      }
    }

    // 5. Validate Item Quantities (Must be strictly positive integers)
    const sanitizedItems: { productId: string; quantity: number }[] = [];
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_PRODUCT_ID', message: 'Identificador de producto no válido.' } },
          { status: 400 }
        );
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 1000) {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_QUANTITY', message: 'La cantidad debe ser un número entero positivo entre 1 y 1000.' } },
          { status: 400 }
        );
      }

      sanitizedItems.push({ productId: item.productId, quantity: qty });
    }

    // 6. Fetch Official Products from Database (NEVER trust client-sent prices or totals)
    const productIds = sanitizedItems.map(i => i.productId);
    const dbProducts = await prisma.storeProduct.findMany({
      where: {
        id: { in: productIds },
        tenantId: tenant.id, // Enforce tenant isolation strictly
        isActive: true,
      },
    });

    if (dbProducts.length !== new Set(productIds).size) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PRODUCT_MISMATCH',
            message: 'Uno o varios productos no existen, están inactivos o no pertenecen a este comercio.',
          },
        },
        { status: 400 }
      );
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // 7. Verify Stock and Compute Authoritative Total on Server
    let calculatedTotal = new Prisma.Decimal(0);
    const orderLinesToCreate: {
      productId: string;
      productName: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
      totalPrice: Prisma.Decimal;
    }[] = [];

    for (const item of sanitizedItems) {
      const product = productMap.get(item.productId)!;

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Stock insuficiente para "${product.name}". Disponibles: ${product.stock}, solicitados: ${item.quantity}.`,
            },
          },
          { status: 400 }
        );
      }

      const unitPrice = new Prisma.Decimal(product.price);
      const lineTotal = unitPrice.mul(item.quantity);
      calculatedTotal = calculatedTotal.add(lineTotal);

      orderLinesToCreate.push({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    // 8. Atomic Prisma Transaction: Deduct Stock and Create Order
    // State is PENDING (never blindly COMPLETED without gateway verification)
    const createdOrder = await prisma.$transaction(async tx => {
      // Deduct stock atomically
      for (const item of sanitizedItems) {
        await tx.storeProduct.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Create Order & Items
      const order = await tx.storeOrder.create({
        data: {
          tenantId: tenant.id,
          customerName: customerName.trim(),
          customerEmail: normalizedEmail,
          totalAmount: calculatedTotal,
          currency: 'EUR',
          status: 'PENDING',
          idempotencyKey,
          items: {
            create: orderLinesToCreate.map(line => ({
              productId: line.productId,
              productName: line.productName,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              totalPrice: line.totalPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });

    return NextResponse.json({
      ok: true,
      data: {
        orderId: createdOrder.id,
        status: createdOrder.status,
        totalAmount: Number(createdOrder.totalAmount),
        currency: createdOrder.currency,
        itemsCount: createdOrder.items.length,
        message: 'Pedido registrado con éxito en estado PENDING pendiente de cobro.',
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'Error interno al procesar el pedido.' } },
      { status: 500 }
    );
  }
}
