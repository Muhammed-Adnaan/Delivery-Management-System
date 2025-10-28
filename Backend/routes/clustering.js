const express = require('express');
const router = express.Router();
const clusteringController = require('../controllers/clusteringController');

router.post('/cluster-orders', clusteringController.clusterAndBatchOrders);

module.exports = router; 