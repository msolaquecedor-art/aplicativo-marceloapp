import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: [{ dataServico: 'asc' }, { horaInicio: 'asc' }] });

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(18).text('Agenda Pro Serviços - Agenda Completa');
  doc.moveDown();

  services.forEach((service) => {
    doc
      .fontSize(11)
      .text(
        `${service.dataServico.toISOString().slice(0, 10)} ${service.horaInicio}-${service.horaFim} | ${service.nomeCliente} | ${service.tipoServico} | R$ ${service.valorServico.toFixed(2)}`
      );
  });

  doc.end();

  await new Promise<void>((resolve) => {
    doc.on('end', () => resolve());
  });

  const buffer = Buffer.concat(chunks);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="agenda-pro-servicos.pdf"'
    }
  });
}
