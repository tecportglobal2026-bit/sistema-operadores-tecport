const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { generarCodigoOperador } = require('../utils/codigoOperador');
const { calcularEstadoPorFecha, resolverEstadoActual } = require('../utils/certificacionEstado');

function limpiarOpcional(valor) {
  return valor === '' ? null : valor ?? null;
}

// Certificación "principal" = la de vencimiento más próximo entre las no inactivadas.
function obtenerCertificacionPrincipal(certificaciones) {
  const candidatas = certificaciones
    .filter((c) => c.estado !== 'inactivo')
    .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

  if (candidatas.length === 0) return null;

  const principal = candidatas[0];
  return { ...principal, estado: resolverEstadoActual(principal) };
}

async function validarEmpresaExiste(empresaId) {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) throw new ApiError(400, 'La empresa indicada no existe');
}

async function validarEquipoExiste(equipoId) {
  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo) throw new ApiError(400, 'El equipo indicado no existe');
}

async function listarOperadores({
  search,
  region,
  empresaId,
  equipoId,
  activo,
  estadoCertificacion,
  page = 1,
  pageSize = 20,
}) {
  const where = {};

  if (search) {
    where.OR = [
      { nombreCompleto: { contains: search, mode: 'insensitive' } },
      { dni: { contains: search, mode: 'insensitive' } },
      { empresa: { nombre: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (region) where.region = region;
  if (empresaId) where.empresaId = empresaId;
  if (activo !== undefined) where.activo = activo;
  if (equipoId) where.certificaciones = { some: { equipoId } };

  const operadores = await prisma.operador.findMany({
    where,
    include: {
      empresa: true,
      certificaciones: { orderBy: { fechaVencimiento: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  let resultado = operadores.map((op) => ({
    ...op,
    certificacionPrincipal: obtenerCertificacionPrincipal(op.certificaciones),
  }));

  if (estadoCertificacion) {
    resultado = resultado.filter((op) => {
      if (estadoCertificacion === 'sin_certificacion') return !op.certificacionPrincipal;
      return op.certificacionPrincipal?.estado === estadoCertificacion;
    });
  }

  const total = resultado.length;
  const start = (page - 1) * pageSize;
  const data = resultado.slice(start, start + pageSize);

  return { data, total, page: Number(page), pageSize: Number(pageSize) };
}

async function obtenerOperadorPorId(id) {
  const operador = await prisma.operador.findUnique({
    where: { id },
    include: {
      empresa: true,
      certificaciones: {
        include: { equipo: true },
        orderBy: { fechaVencimiento: 'asc' },
      },
    },
  });

  if (!operador) throw new ApiError(404, 'Operador no encontrado');

  const certificaciones = operador.certificaciones.map((c) => ({
    ...c,
    estado: resolverEstadoActual(c),
  }));

  return {
    ...operador,
    certificaciones,
    certificacionPrincipal: obtenerCertificacionPrincipal(operador.certificaciones),
  };
}

async function crearOperador(payload) {
  const { tieneCertificacion, certificacion, ...datosOperador } = payload;

  await validarEmpresaExiste(datosOperador.empresaId);

  const dniExistente = await prisma.operador.findUnique({ where: { dni: datosOperador.dni } });
  if (dniExistente) throw new ApiError(409, 'Ya existe un operador registrado con ese DNI');

  if (tieneCertificacion) {
    await validarEquipoExiste(certificacion.equipoId);
  }

  const codigoOperador = await generarCodigoOperador();

  return prisma.$transaction(async (tx) => {
    const operador = await tx.operador.create({
      data: {
        ...datosOperador,
        celular: limpiarOpcional(datosOperador.celular),
        correo: limpiarOpcional(datosOperador.correo),
        linkedin: limpiarOpcional(datosOperador.linkedin),
        observaciones: limpiarOpcional(datosOperador.observaciones),
        codigoOperador,
      },
    });

    if (tieneCertificacion) {
      const estado = calcularEstadoPorFecha(certificacion.fechaVencimiento);
      await tx.certificacion.create({
        data: {
          ...certificacion,
          archivoUrl: limpiarOpcional(certificacion.archivoUrl),
          observaciones: limpiarOpcional(certificacion.observaciones),
          operadorId: operador.id,
          estado,
        },
      });
    }

    return tx.operador.findUnique({
      where: { id: operador.id },
      include: { empresa: true, certificaciones: true },
    });
  });
}

async function actualizarOperador(id, payload) {
  await obtenerOperadorPorId(id);

  if (payload.empresaId) await validarEmpresaExiste(payload.empresaId);

  if (payload.dni) {
    const dniExistente = await prisma.operador.findFirst({
      where: { dni: payload.dni, NOT: { id } },
    });
    if (dniExistente) throw new ApiError(409, 'Ya existe otro operador con ese DNI');
  }

  return prisma.operador.update({
    where: { id },
    data: {
      ...payload,
      celular: payload.celular !== undefined ? limpiarOpcional(payload.celular) : undefined,
      correo: payload.correo !== undefined ? limpiarOpcional(payload.correo) : undefined,
      linkedin: payload.linkedin !== undefined ? limpiarOpcional(payload.linkedin) : undefined,
      observaciones: payload.observaciones !== undefined ? limpiarOpcional(payload.observaciones) : undefined,
    },
    include: { empresa: true },
  });
}

async function desactivarOperador(id, motivoInactivo) {
  await obtenerOperadorPorId(id);
  return prisma.operador.update({
    where: { id },
    data: { activo: false, motivoInactivo, fechaInactivacion: new Date() },
  });
}

async function reactivarOperador(id) {
  await obtenerOperadorPorId(id);
  return prisma.operador.update({
    where: { id },
    data: { activo: true, motivoInactivo: null, fechaInactivacion: null },
  });
}

module.exports = {
  listarOperadores,
  obtenerOperadorPorId,
  crearOperador,
  actualizarOperador,
  desactivarOperador,
  reactivarOperador,
};
