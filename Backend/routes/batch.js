const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.post('/assign-batch', batchController.assignBatchToDriver);

module.exports = router; 