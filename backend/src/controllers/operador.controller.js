const asyncHandler = require('../utils/asyncHandler');
const operadorService = require('../services/operador.service');
const {
  crearOperadorSchema,
  actualizarOperadorSchema,
  desactivarOperadorSchema,
} = require('../validators/operador.validator');

const listar = asyncHandler(async (req, res) => {
  const { search, region, empresaId, equipoId, activo, estadoCertificacion, page, pageSize } = req.query;
  const resultado = await operadorService.listarOperadores({
    search,
    region,
    empresaId,
    equipoId,
    activo: activo === undefined ? undefined : activo === 'true',
    estadoCertificacion,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  res.json(resultado);
});

const obtener = asyncHandler(async (req, res) => {
  const operador = await operadorService.obtenerOperadorPorId(req.params.id);
  res.json(operador);
});

const crear = asyncHandler(async (req, res) => {
  const data = crearOperadorSchema.parse(req.body);
  const operador = await operadorService.crearOperador(data);
  res.status(201).json(operador);
});

const actualizar = asyncHandler(async (req, res) => {
  const data = actualizarOperadorSchema.parse(req.body);
  const operador = await operadorService.actualizarOperador(req.params.id, data);
  res.json(operador);
});

const desactivar = asyncHandler(async (req, res) => {
  const { motivoInactivo } = desactivarOperadorSchema.parse(req.body);
  const operador = await operadorService.desactivarOperador(req.params.id, motivoInactivo);
  res.json(operador);
});

const reactivar = asyncHandler(async (req, res) => {
  const operador = await operadorService.reactivarOperador(req.params.id);
  res.json(operador);
});

module.exports = { listar, obtener, crear, actualizar, desactivar, reactivar };
