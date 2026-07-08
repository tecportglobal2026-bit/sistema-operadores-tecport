import { z } from 'zod';

export const equipoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().trim().optional().or(z.literal('')),
});
