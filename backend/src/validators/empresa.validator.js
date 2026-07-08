const { z } = require('zod');

const TIPOS_EMPRESA = ['TECPORT', 'Cliente', 'Partner', 'Logistica', 'Portuaria', 'Otra'];
const REGIONES = ['Lima', 'Norte', 'Sur', 'Centro'];

const empresaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  ruc: z.string().trim().min(1).optional().nullable().or(z.literal('')),
  tipoEmpresa: z.enum(TIPOS_EMPRESA, { required_error: 'El tipo de empresa es obligatorio' }),
  region: z.enum(REGIONES, { required_error: 'La región es obligatoria' }),
});

const empresaUpdateSchema = empresaSchema.partial();

module.exports = { empresaSchema, empresaUpdateSchema, TIPOS_EMPRESA, REGIONES };
