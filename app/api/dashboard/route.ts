import { NextResponse } from 'next/server';
import { endOfMonth, endOfToday, endOfWeek, startOfMonth, startOfToday, startOfWeek } from 'date-fns';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const now = new Date();

  const [today, week, month, concludedCount, scheduledCount] = await Promise.all([
    prisma.service.aggregate({
      where: { dataServico: { gte: startOfToday(), lte: endOfToday() }, status: { not: 'CANCELADO' } },
      _sum: { valorServico: true },
      _count: { _all: true }
    }),
    prisma.service.aggregate({
      where: {
        dataServico: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) },
        status: { not: 'CANCELADO' }
      },
      _sum: { valorServico: true }
    }),
    prisma.service.aggregate({
      where: { dataServico: { gte: startOfMonth(now), lte: endOfMonth(now) }, status: { not: 'CANCELADO' } },
      _sum: { valorServico: true }
    }),
    prisma.service.count({ where: { status: 'CONCLUIDO' } }),
    prisma.service.count({ where: { status: 'AGENDADO' } })
  ]);

  return NextResponse.json({
    servicosHoje: today._count._all,
    valorHoje: today._sum.valorServico ?? 0,
    valorSemana: week._sum.valorServico ?? 0,
    valorMes: month._sum.valorServico ?? 0,
    concluidos: concludedCount,
    agendados: scheduledCount
  });
}
