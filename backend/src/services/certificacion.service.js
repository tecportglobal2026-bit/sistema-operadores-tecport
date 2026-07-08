const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { calcularEstadoPorFecha, resolverEstadoActual } = require('../utils/certificacionEstado');

function limpiarOpcional(valor) {
  return valor === '' ? null : valor ?? null;
}

async function validarOperadorExiste(operadorId) {
  const operador = await prisma.operador.findUnique({ where: { id: operadorId } });
  if (!operador) throw new ApiError(400, 'El operador indicado no existe');
}

async function validarEquipoExiste(equipoId) {
  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo) throw new ApiError(400, 'El equipo indicado no existe');
}

function conEstadoResuelto(certificacion) {
  return { ...certificacion, estado: resolverEstadoActual(certificacion) };
}

async function listarCertificaciones({ search, empresaId, equipoId, estado, page = 1, pageSize = 20 }) {
  const filtros = [];

  if (search) {
    filtros.push({
      OR: [
        { nombreCertificacion: { contains: search, mode: 'insensitive' } },
        { operador: { nombreCompleto: { contains: search, mode: 'insensitive' } } },
        { operador: { dni: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }
  if (empresaId) filtros.push({ operador: { empresaId } });
  if (equipoId) filtros.push({ equipoId });

  const certificaciones = await prisma.certificacion.findMany({
    where: filtros.length ? { AND: filtros } : undefined,
    include: { operador: { include: { empresa: true } }, equipo: true },
    orderBy: { fechaVencimiento: 'asc' },
  });

  let resultado = certificaciones.map(conEstadoResuelto);

  if (estado) {
    resultado = resultado.filter((c) => c.estado === estado);
  }

  const total = resultado.length;
  const start = (page - 1) * pageSize;
  const data = resultado.slice(start, start + pageSize);

  return { data, total, page: Number(page), pageSize: Number(pageSize) };
}

async function obtenerCertificacionPorId(id) {
  const certificacion = await prisma.certificacion.findUnique({
    where: { id },
    include: { operador: true, equipo: true },
  });
  if (!certificacion) throw new ApiError(404, 'Certificación no encontrada');
  return conEstadoResuelto(certificacion);
}

async function crearCertificacion(payload) {
  await validarOperadorExiste(payload.operadorId);
  await validarEquipoExiste(payload.equipoId);

  const estado = calcularEstadoPorFecha(payload.fechaVencimiento);

  return prisma.certificacion.create({
    data: {
      ...payload,
      archivoUrl: limpiarOpcional(payload.archivoUrl),
      observaciones: limpiarOpcional(payload.observaciones),
      estado,
    },
  });
}

async function actualizarCertificacion(id, payload) {
  const actual = await prisma.certificacion.findUnique({ where: { id } });
  if (!actual) throw new ApiError(404, 'Certificación no encontrada');

  if (payload.operadorId) await validarOperadorExiste(payload.operadorId);
  if (payload.equipoId) await validarEquipoExiste(payload.equipoId);

  const fechaVencimiento = payload.fechaVencimiento ?? actual.fechaVencimiento;
  const estado = actual.estado === 'inactivo' ? 'inactivo' : calcularEstadoPorFecha(fechaVencimiento);

  return prisma.certificacion.update({
    where: { id },
    data: {
      ...payload,
      archivoUrl: payload.archivoUrl !== undefined ? limpiarOpcional(payload.archivoUrl) : undefined,
      observaciones: payload.observaciones !== undefined ? limpiarOpcional(payload.observaciones) : undefined,
      estado,
    },
  });
}

async function inactivarCertificacion(id) {
  const actual = await prisma.certificacion.findUnique({ where: { id } });
  if (!actual) throw new ApiError(404, 'Certificación no encontrada');

  return prisma.certificacion.update({ where: { id }, data: { estado: 'inactivo' } });
}

module.exports = {
  listarCertificaciones,
  obtenerCertificacionPorId,
  crearCertificacion,
  actualizarCertificacion,
  inactivarCertificacion,
};
