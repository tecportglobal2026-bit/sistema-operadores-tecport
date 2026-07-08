const DIAS_POR_VENCER = 30;

function calcularEstadoPorFecha(fechaVencimiento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  const diffDias = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return 'vencido';
  if (diffDias <= DIAS_POR_VENCER) return 'por_vencer';
  return 'vigente';
}

// El estado guardado en BD solo se recalcula al crear/editar una certificación.
// Para lectura (listados, detalle, dashboard) resolvemos el estado real contra la
// fecha actual, salvo que haya sido inactivada manualmente, para evitar que una
// certificación se quede mostrando "vigente" semanas después de haber vencido.
function resolverEstadoActual(certificacion) {
  if (certificacion.estado === 'inactivo') return 'inactivo';
  return calcularEstadoPorFecha(certificacion.fechaVencimiento);
}

module.exports = { calcularEstadoPorFecha, resolverEstadoActual, DIAS_POR_VENCER };
