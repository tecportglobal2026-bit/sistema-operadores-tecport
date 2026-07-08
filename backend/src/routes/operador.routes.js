const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const operadorController = require('../controllers/operador.controller');

const router = Router();

router.use(requireAuth);
router.get('/', operadorController.listar);
router.get('/:id', operadorController.obtener);
router.post('/', operadorController.crear);
router.put('/:id', operadorController.actualizar);
router.patch('/:id/desactivar', operadorController.desactivar);
router.patch('/:id/reactivar', operadorController.reactivar);

module.exports = router;
