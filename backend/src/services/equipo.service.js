const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listarEquipos({ search }) {
  return prisma.equipo.findMany({
    where: search ? { nombre: { contains: search, mode: 'insensitive' } } : undefined,
    orderBy: { nombre: 'asc' },
  });
}

async function obtenerEquipoPorId(id) {
  const equipo = await prisma.equipo.findUnique({ where: { id } });
  if (!equipo) throw new ApiError(404, 'Equipo no encontrado');
  return equipo;
}

async function crearEquipo(data) {
  return prisma.equipo.create({
    data: { ...data, descripcion: data.descripcion === '' ? null : data.descripcion ?? null },
  });
}

async function actualizarEquipo(id, data) {
  await obtenerEquipoPorId(id);
  return prisma.equipo.update({
    where: { id },
    data: { ...data, descripcion: data.descripcion === '' ? null : data.descripcion },
  });
}

module.exports = { listarEquipos, obtenerEquipoPorId, crearEquipo, actualizarEquipo };
