import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: [{ dataServico: 'asc' }, { horaInicio: 'asc' }] });
  const header =
    'id,nomeCliente,tipoServico,dataServico,horaInicio,horaFim,localServico,valorServico,status\n';
  const rows = services
    .map(
      (s) =>
        `${s.id},"${s.nomeCliente}",${s.tipoServico},${s.dataServico.toISOString().slice(0, 10)},${s.horaInicio},${s.horaFim},"${s.localServico}",${s.valorServico},${s.status}`
    )
    .join('\n');

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="servicos.csv"'
    }
  });
}
