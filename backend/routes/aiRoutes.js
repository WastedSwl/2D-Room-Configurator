const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate-module', authMiddleware, aiController.generateModuleConfig);

module.exports = router;