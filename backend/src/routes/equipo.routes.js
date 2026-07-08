const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const equipoController = require('../controllers/equipo.controller');

const router = Router();

router.use(requireAuth);
router.get('/', equipoController.listar);
router.get('/:id', equipoController.obtener);
router.post('/', equipoController.crear);
router.put('/:id', equipoController.actualizar);

module.exports = router;
