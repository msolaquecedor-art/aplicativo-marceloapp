import { Prisma, ServiceStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hasTimeConflict } from '@/app/lib/time';
import { serviceSchema } from '@/app/lib/validators';

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida.');
  return date;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cliente = searchParams.get('cliente');
  const tipoServico = searchParams.get('tipoServico');
  const status = searchParams.get('status') as ServiceStatus | null;
  const data = searchParams.get('data');
  const quickSearch = searchParams.get('q');

  const where: Prisma.ServiceWhereInput = {
    AND: [
      cliente ? { nomeCliente: { contains: cliente, mode: 'insensitive' } } : {},
      quickSearch ? { nomeCliente: { contains: quickSearch, mode: 'insensitive' } } : {},
      tipoServico ? { tipoServico: tipoServico as Prisma.EnumServiceTypeFilter['equals'] } : {},
      status ? { status } : {},
      data
        ? {
            dataServico: {
              gte: new Date(`${data}T00:00:00`),
              lt: new Date(`${data}T23:59:59.999`)
            }
          }
        : {}
    ]
  };

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ dataServico: 'asc' }, { horaInicio: 'asc' }]
  });

  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = serviceSchema.parse(body);

    if (parsed.horaFim <= parsed.horaInicio) {
      return NextResponse.json({ message: 'Hora fim deve ser maior que hora início.' }, { status: 400 });
    }

    const serviceDate = parseDate(parsed.dataServico);
    const existing = await prisma.service.findMany({
      where: {
        dataServico: {
          gte: new Date(`${parsed.dataServico}T00:00:00`),
          lt: new Date(`${parsed.dataServico}T23:59:59.999`)
        },
        status: { not: 'CANCELADO' }
      }
    });

    const conflict = existing.some((service) =>
      hasTimeConflict(parsed.horaInicio, parsed.horaFim, service.horaInicio, service.horaFim)
    );

    if (conflict) {
      return NextResponse.json(
        { message: '⚠️ Este horário já está ocupado. Escolha outro horário.' },
        { status: 409 }
      );
    }

    const created = await prisma.service.create({
      data: {
        ...parsed,
        telefoneCliente: parsed.telefoneCliente || null,
        observacoes: parsed.observacoes || null,
        dataServico: serviceDate
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao cadastrar serviço.', error }, { status: 400 });
  }
}
