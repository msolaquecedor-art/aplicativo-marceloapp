export const serviceTypes = [
  'MANUTENCAO',
  'INSTALACAO',
  'LIMPEZA',
  'VISITA_TECNICA',
  'ORCAMENTO',
  'OUTRO'
] as const;

export const serviceTypeLabels: Record<(typeof serviceTypes)[number], string> = {
  MANUTENCAO: 'Manutenção',
  INSTALACAO: 'Instalação',
  LIMPEZA: 'Limpeza',
  VISITA_TECNICA: 'Visita Técnica',
  ORCAMENTO: 'Orçamento',
  OUTRO: 'Outro'
};

export const serviceTypeColors: Record<(typeof serviceTypes)[number], string> = {
  MANUTENCAO: 'bg-blue-100 text-blue-700 border-blue-200',
  INSTALACAO: 'bg-green-100 text-green-700 border-green-200',
  LIMPEZA: 'bg-purple-100 text-purple-700 border-purple-200',
  VISITA_TECNICA: 'bg-orange-100 text-orange-700 border-orange-200',
  ORCAMENTO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  OUTRO: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const serviceStatuses = ['AGENDADO', 'CONCLUIDO', 'CANCELADO'] as const;
