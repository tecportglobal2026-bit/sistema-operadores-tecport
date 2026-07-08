const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const certificacionController = require('../controllers/certificacion.controller');

const router = Router();

router.use(requireAuth);
router.get('/', certificacionController.listar);
router.get('/:id', certificacionController.obtener);
router.post('/', certificacionController.crear);
router.put('/:id', certificacionController.actualizar);
router.patch('/:id/inactivar', certificacionController.inactivar);

module.exports = router;
