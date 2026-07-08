const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

router.get('/resumen', requireAuth, dashboardController.resumen);

module.exports = router;
