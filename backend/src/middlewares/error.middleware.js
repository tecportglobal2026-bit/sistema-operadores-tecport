const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

function errorMiddleware(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Datos inválidos', details: err.flatten() });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único', details: err.meta });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'La referencia indicada no existe', details: err.meta });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorMiddleware;
