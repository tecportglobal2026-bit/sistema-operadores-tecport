const { z } = require('zod');

const certificacionSchema = z.object({
  operadorId: z.string().uuid('Operador inválido'),
  equipoId: z.string().uuid('Equipo inválido'),
  nombreCertificacion: z.string().trim().min(1, 'El nombre de la certificación es obligatorio'),
  entidadEmisora: z.string().trim().min(1, 'La entidad emisora es obligatoria'),
  fechaEmision: z.coerce.date().optional().nullable(),
  fechaVencimiento: z.coerce.date({ required_error: 'La fecha de vencimiento es obligatoria' }),
  archivoUrl: z.string().trim().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  observaciones: z.string().trim().optional().nullable().or(z.literal('')),
});

const certificacionUpdateSchema = certificacionSchema.partial();

module.exports = { certificacionSchema, certificacionUpdateSchema };
