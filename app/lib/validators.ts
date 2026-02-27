import { z } from 'zod';
import { serviceStatuses, serviceTypes } from './types';

export const serviceSchema = z.object({
  nomeCliente: z.string().min(2, 'Informe o nome do cliente.'),
  telefoneCliente: z.string().optional().or(z.literal('')),
  tipoServico: z.enum(serviceTypes),
  dataServico: z.string().min(1),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  horaFim: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  localServico: z.string().min(2),
  enderecoCompleto: z.string().min(5),
  valorServico: z.coerce.number().nonnegative(),
  observacoes: z.string().optional().or(z.literal('')),
  status: z.enum(serviceStatuses).default('AGENDADO')
});

export type ServiceInput = z.infer<typeof serviceSchema>;
