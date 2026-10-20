import { NextRequest, NextResponse } from 'next/server';
import { repo } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');

  let list = repo.storeProducts.filter(p => p.status === 'ACTIVE');
  if (category && category !== 'ALL') {
    list = list.filter(p => p.category === category);
  }

  return NextResponse.json({ ok: true, data: list });
}
