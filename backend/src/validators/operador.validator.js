const { z } = require('zod');
const { REGIONES } = require('./empresa.validator');

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado', 'Maestro'];

const certificacionInicialSchema = z.object({
  equipoId: z.string().uuid('Equipo inválido'),
  nombreCertificacion: z.string().trim().min(1, 'El nombre de la certificación es obligatorio'),
  entidadEmisora: z.string().trim().min(1, 'La entidad emisora es obligatoria'),
  fechaEmision: z.coerce.date().optional().nullable(),
  fechaVencimiento: z.coerce.date({ required_error: 'La fecha de vencimiento es obligatoria' }),
  archivoUrl: z.string().trim().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  observaciones: z.string().trim().optional().nullable().or(z.literal('')),
});

const operadorBaseSchema = z.object({
  nombreCompleto: z.string().trim().min(1, 'El nombre completo es obligatorio'),
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
  fechaNacimiento: z.coerce.date().optional().nullable(),
  celular: z.string().trim().optional().nullable().or(z.literal('')),
  correo: z.string().trim().email('Correo inválido').optional().nullable().or(z.literal('')),
  linkedin: z.string().trim().url('LinkedIn debe ser una URL válida').optional().nullable().or(z.literal('')),
  region: z.enum(REGIONES, { required_error: 'La región es obligatoria' }),
  empresaId: z.string().uuid('Empresa inválida'),
  nivel: z.enum(NIVELES, { required_error: 'El nivel es obligatorio' }),
  observaciones: z.string().trim().optional().nullable().or(z.literal('')),
});

const crearOperadorSchema = operadorBaseSchema
  .extend({
    tieneCertificacion: z.boolean().optional().default(false),
    certificacion: certificacionInicialSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tieneCertificacion && !data.certificacion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes completar los datos de la certificación inicial',
        path: ['certificacion'],
      });
    }
  });

const actualizarOperadorSchema = operadorBaseSchema.partial();

const desactivarOperadorSchema = z.object({
  motivoInactivo: z.string().trim().min(1, 'El motivo de inactivación es obligatorio'),
});

module.exports = {
  NIVELES,
  crearOperadorSchema,
  actualizarOperadorSchema,
  desactivarOperadorSchema,
};
