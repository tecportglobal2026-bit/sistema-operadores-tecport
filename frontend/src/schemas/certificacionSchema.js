import { z } from 'zod';

export const certificacionSchema = z.object({
  operadorId: z.string().min(1, 'Selecciona un operador'),
  equipoId: z.string().min(1, 'Selecciona un equipo'),
  nombreCertificacion: z.string().trim().min(1, 'El nombre de la certificación es obligatorio'),
  entidadEmisora: z.string().trim().min(1, 'La entidad emisora es obligatoria'),
  fechaEmision: z.string().optional().or(z.literal('')),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  archivoUrl: z.string().trim().url('Debe ser una URL válida').optional().or(z.literal('')),
  observaciones: z.string().trim().optional().or(z.literal('')),
});
