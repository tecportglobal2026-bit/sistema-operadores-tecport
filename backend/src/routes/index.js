const { Router } = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const empresaRoutes = require('./empresa.routes');
const equipoRoutes = require('./equipo.routes');
const operadorRoutes = require('./operador.routes');
const certificacionRoutes = require('./certificacion.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes);
router.use('/equipos', equipoRoutes);
router.use('/operadores', operadorRoutes);
router.use('/certificaciones', certificacionRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
