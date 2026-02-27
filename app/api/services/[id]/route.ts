import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hasTimeConflict } from '@/app/lib/time';
import { serviceSchema } from '@/app/lib/validators';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: Number(params.id) } });
  if (!service) return NextResponse.json({ message: 'Serviço não encontrado.' }, { status: 404 });
  return NextResponse.json(service);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = serviceSchema.parse(body);
    const id = Number(params.id);

    if (parsed.horaFim <= parsed.horaInicio) {
      return NextResponse.json({ message: 'Hora fim deve ser maior que hora início.' }, { status: 400 });
    }

    const sameDay = await prisma.service.findMany({
      where: {
        id: { not: id },
        dataServico: {
          gte: new Date(`${parsed.dataServico}T00:00:00`),
          lt: new Date(`${parsed.dataServico}T23:59:59.999`)
        },
        status: { not: 'CANCELADO' }
      }
    });

    const conflict = sameDay.some((service) =>
      hasTimeConflict(parsed.horaInicio, parsed.horaFim, service.horaInicio, service.horaFim)
    );

    if (conflict) {
      return NextResponse.json(
        { message: '⚠️ Este horário já está ocupado. Escolha outro horário.' },
        { status: 409 }
      );
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...parsed,
        telefoneCliente: parsed.telefoneCliente || null,
        observacoes: parsed.observacoes || null,
        dataServico: new Date(`${parsed.dataServico}T00:00:00`)
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao atualizar serviço.', error }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.service.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
