const asyncHandler = require('../utils/asyncHandler');
const empresaService = require('../services/empresa.service');
const { empresaSchema, empresaUpdateSchema } = require('../validators/empresa.validator');

const listar = asyncHandler(async (req, res) => {
  const empresas = await empresaService.listarEmpresas({ search: req.query.search });
  res.json(empresas);
});

const obtener = asyncHandler(async (req, res) => {
  const empresa = await empresaService.obtenerEmpresaPorId(req.params.id);
  res.json(empresa);
});

const crear = asyncHandler(async (req, res) => {
  const data = empresaSchema.parse(req.body);
  const empresa = await empresaService.crearEmpresa(data);
  res.status(201).json(empresa);
});

const actualizar = asyncHandler(async (req, res) => {
  const data = empresaUpdateSchema.parse(req.body);
  const empresa = await empresaService.actualizarEmpresa(req.params.id, data);
  res.json(empresa);
});

module.exports = { listar, obtener, crear, actualizar };
