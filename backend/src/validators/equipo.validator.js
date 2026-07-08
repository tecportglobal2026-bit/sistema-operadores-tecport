const { z } = require('zod');

const equipoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().trim().optional().nullable().or(z.literal('')),
});

const equipoUpdateSchema = equipoSchema.partial();

module.exports = { equipoSchema, equipoUpdateSchema };
