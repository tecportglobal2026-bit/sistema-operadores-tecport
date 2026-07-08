const asyncHandler = require('../utils/asyncHandler');
const certificacionService = require('../services/certificacion.service');
const { certificacionSchema, certificacionUpdateSchema } = require('../validators/certificacion.validator');

const listar = asyncHandler(async (req, res) => {
  const { search, empresaId, equipoId, estado, page, pageSize } = req.query;
  const resultado = await certificacionService.listarCertificaciones({
    search,
    empresaId,
    equipoId,
    estado,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  res.json(resultado);
});

const obtener = asyncHandler(async (req, res) => {
  const certificacion = await certificacionService.obtenerCertificacionPorId(req.params.id);
  res.json(certificacion);
});

const crear = asyncHandler(async (req, res) => {
  const data = certificacionSchema.parse(req.body);
  const certificacion = await certificacionService.crearCertificacion(data);
  res.status(201).json(certificacion);
});

const actualizar = asyncHandler(async (req, res) => {
  const data = certificacionUpdateSchema.parse(req.body);
  const certificacion = await certificacionService.actualizarCertificacion(req.params.id, data);
  res.json(certificacion);
});

const inactivar = asyncHandler(async (req, res) => {
  const certificacion = await certificacionService.inactivarCertificacion(req.params.id);
  res.json(certificacion);
});

module.exports = { listar, obtener, crear, actualizar, inactivar };
