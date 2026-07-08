const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');

const resumen = asyncHandler(async (req, res) => {
  const data = await dashboardService.obtenerResumen();
  res.json(data);
});

module.exports = { resumen };
