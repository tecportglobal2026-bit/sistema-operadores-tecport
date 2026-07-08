import { z } from 'zod';
import { REGIONES, NIVELES } from '../utils/constants';

const camposBase = {
  nombreCompleto: z.string().trim().min(1, 'El nombre completo es obligatorio'),
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
  fechaNacimiento: z.string().optional().or(z.literal('')),
  celular: z.string().trim().optional().or(z.literal('')),
  correo: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
  linkedin: z.string().trim().url('LinkedIn debe ser una URL válida').optional().or(z.literal('')),
  region: z.enum(REGIONES, { required_error: 'La región es obligatoria' }),
  empresaId: z.string().min(1, 'Selecciona una empresa'),
  nivel: z.enum(NIVELES, { required_error: 'El nivel es obligatorio' }),
  observaciones: z.string().trim().optional().or(z.literal('')),
};

const certificacionInicialSchema = z.object({
  equipoId: z.string().min(1, 'Selecciona un equipo'),
  nombreCertificacion: z.string().trim().min(1, 'El nombre de la certificación es obligatorio'),
  entidadEmisora: z.string().trim().min(1, 'La entidad emisora es obligatoria'),
  fechaEmision: z.string().optional().or(z.literal('')),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  archivoUrl: z.string().trim().url('Debe ser una URL válida').optional().or(z.literal('')),
  observaciones: z.string().trim().optional().or(z.literal('')),
});

export const operadorCrearSchema = z
  .object({
    ...camposBase,
    tieneCertificacion: z.boolean().optional().default(false),
    certificacion: certificacionInicialSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tieneCertificacion) {
      const resultado = certificacionInicialSchema.safeParse(data.certificacion || {});
      if (!resultado.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Completa los datos de la certificación inicial',
          path: ['certificacion'],
        });
      }
    }
  });

export const operadorEditSchema = z.object(camposBase);

export const desactivarOperadorSchema = z.object({
  motivoInactivo: z.string().trim().min(1, 'El motivo de inactivación es obligatorio'),
});
