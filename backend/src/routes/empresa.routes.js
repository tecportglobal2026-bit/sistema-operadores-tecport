const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const empresaController = require('../controllers/empresa.controller');

const router = Router();

router.use(requireAuth);
router.get('/', empresaController.listar);
router.get('/:id', empresaController.obtener);
router.post('/', empresaController.crear);
router.put('/:id', empresaController.actualizar);

module.exports = router;
