const prisma = require('../config/prisma');
const { resolverEstadoActual } = require('../utils/certificacionEstado');

async function obtenerResumen() {
  const [totalOperadores, operadoresActivos, totalEmpresas, totalEquipos, operadoresPorRegion, equipos, certificaciones] =
    await Promise.all([
      prisma.operador.count(),
      prisma.operador.count({ where: { activo: true } }),
      prisma.empresa.count(),
      prisma.equipo.count(),
      prisma.operador.groupBy({ by: ['region'], _count: true }),
      prisma.equipo.findMany({ select: { id: true, nombre: true } }),
      prisma.certificacion.findMany({
        include: { operador: true, equipo: true },
        orderBy: { fechaVencimiento: 'asc' },
      }),
    ]);

  const certificacionesResueltas = certificaciones.map((c) => ({ ...c, estado: resolverEstadoActual(c) }));

  const contarPorEstado = (estado) => certificacionesResueltas.filter((c) => c.estado === estado).length;

  const operadoresPorEquipoMap = new Map();
  for (const cert of certificacionesResueltas) {
    if (cert.estado === 'inactivo') continue;
    if (!operadoresPorEquipoMap.has(cert.equipoId)) {
      operadoresPorEquipoMap.set(cert.equipoId, new Set());
    }
    operadoresPorEquipoMap.get(cert.equipoId).add(cert.operadorId);
  }

  const operadoresPorEquipo = equipos.map((equipo) => ({
    equipoId: equipo.id,
    equipo: equipo.nombre,
    totalOperadores: operadoresPorEquipoMap.get(equipo.id)?.size ?? 0,
  }));

  const certificacionesProximasAVencer = certificacionesResueltas.filter((c) => c.estado === 'por_vencer').slice(0, 10);

  return {
    totalOperadores,
    operadoresActivos,
    operadoresInactivos: totalOperadores - operadoresActivos,
    totalEmpresas,
    totalEquipos,
    certificacionesVigentes: contarPorEstado('vigente'),
    certificacionesPorVencer: contarPorEstado('por_vencer'),
    certificacionesVencidas: contarPorEstado('vencido'),
    operadoresPorRegion: operadoresPorRegion.map((r) => ({ region: r.region, total: r._count })),
    operadoresPorEquipo,
    certificacionesProximasAVencer,
  };
}

module.exports = { obtenerResumen };
