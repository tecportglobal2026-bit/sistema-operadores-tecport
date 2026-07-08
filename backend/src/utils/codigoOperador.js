const prisma = require('../config/prisma');

// Requiere la secuencia `operador_codigo_seq` creada en Postgres (ver README del backend).
// Usar una secuencia de Postgres evita condiciones de carrera al generar códigos en paralelo.
async function generarCodigoOperador() {
  const [{ valor }] = await prisma.$queryRaw`SELECT nextval('operador_codigo_seq') AS valor`;
  const numero = Number(valor);
  return `OP-${String(numero).padStart(4, '0')}`;
}

module.exports = { generarCodigoOperador };
