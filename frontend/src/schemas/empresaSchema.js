import { z } from 'zod';
import { TIPOS_EMPRESA, REGIONES } from '../utils/constants';

export const empresaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  ruc: z.string().trim().optional().or(z.literal('')),
  tipoEmpresa: z.enum(TIPOS_EMPRESA, { required_error: 'El tipo de empresa es obligatorio' }),
  region: z.enum(REGIONES, { required_error: 'La región es obligatoria' }),
});
