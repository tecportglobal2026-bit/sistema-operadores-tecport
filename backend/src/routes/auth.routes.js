const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = Router();

router.get('/me', requireAuth, authController.me);

module.exports = router;
