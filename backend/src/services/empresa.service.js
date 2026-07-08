const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function listarEmpresas({ search }) {
  return prisma.empresa.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { ruc: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { nombre: 'asc' },
  });
}

async function obtenerEmpresaPorId(id) {
  const empresa = await prisma.empresa.findUnique({ where: { id } });
  if (!empresa) throw new ApiError(404, 'Empresa no encontrada');
  return empresa;
}

async function crearEmpresa(data) {
  return prisma.empresa.create({
    data: { ...data, ruc: data.ruc === '' ? null : data.ruc ?? null },
  });
}

async function actualizarEmpresa(id, data) {
  await obtenerEmpresaPorId(id);
  return prisma.empresa.update({
    where: { id },
    data: { ...data, ruc: data.ruc === '' ? null : data.ruc },
  });
}

module.exports = { listarEmpresas, obtenerEmpresaPorId, crearEmpresa, actualizarEmpresa };
