const asyncHandler = require('../utils/asyncHandler');
const equipoService = require('../services/equipo.service');
const { equipoSchema, equipoUpdateSchema } = require('../validators/equipo.validator');

const listar = asyncHandler(async (req, res) => {
  const equipos = await equipoService.listarEquipos({ search: req.query.search });
  res.json(equipos);
});

const obtener = asyncHandler(async (req, res) => {
  const equipo = await equipoService.obtenerEquipoPorId(req.params.id);
  res.json(equipo);
});

const crear = asyncHandler(async (req, res) => {
  const data = equipoSchema.parse(req.body);
  const equipo = await equipoService.crearEquipo(data);
  res.status(201).json(equipo);
});

const actualizar = asyncHandler(async (req, res) => {
  const data = equipoUpdateSchema.parse(req.body);
  const equipo = await equipoService.actualizarEquipo(req.params.id, data);
  res.json(equipo);
});

module.exports = { listar, obtener, crear, actualizar };
