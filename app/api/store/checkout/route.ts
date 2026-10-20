import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, items, totalAmount } = body;

    if (!customerName || !customerEmail || !items || !items.length) {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_ORDER', message: 'Datos de pedido incompletos.' } }, { status: 400 });
    }

    const orderId = `ord_${Date.now()}`;
    const newOrder = {
      id: orderId,
      tenantId: 'ten_latotaltienda',
      customerName,
      customerEmail,
      items,
      totalAmount: Number(totalAmount),
      currency: 'EUR',
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString(),
    };

    repo.storeOrders.unshift(newOrder);

    // Reduce stock
    for (const item of items) {
      const prod = repo.storeProducts.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    return NextResponse.json({ ok: true, data: { orderId: newOrder.id, message: 'Pedido completado con éxito.' } });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: 'Error al procesar pedido.' } }, { status: 500 });
  }
}
