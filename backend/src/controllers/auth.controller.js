const asyncHandler = require('../utils/asyncHandler');

const me = asyncHandler(async (req, res) => {
  res.json({
    nombre: req.adminProfile.nombre,
    rol: req.adminProfile.rol,
    activo: req.adminProfile.activo,
  });
});

module.exports = { me };
