import { endOfMonth, startOfMonth } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const month = Number(new URL(request.url).searchParams.get('month') ?? new Date().getMonth() + 1);
  const year = Number(new URL(request.url).searchParams.get('year') ?? new Date().getFullYear());

  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);

  const summary = await prisma.service.aggregate({
    where: { dataServico: { gte: start, lte: end }, status: { not: 'CANCELADO' } },
    _sum: { valorServico: true },
    _count: { _all: true }
  });

  return NextResponse.json({
    month,
    year,
    totalServicos: summary._count._all,
    totalFinanceiro: summary._sum.valorServico ?? 0
  });
}
