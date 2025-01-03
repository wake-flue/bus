const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const operationMiddleware = require('../middleware/operationMiddleware');

/**
 * 获取实时公交信息
 */
router.get(
    '/realtime/:lineCode',
    operationMiddleware.setOperation('GET_BUS_REALTIME', 'Bus'),
    busController.getBusRealTimeInfo.bind(busController)
);

/**
 * 获取站点到站时间
 */
router.get(
    '/arrival/:lineCode',
    operationMiddleware.setOperation('GET_BUS_ARRIVAL', 'Bus'),
    busController.getStationArrivalTime.bind(busController)
);

/**
 * 获取发车计划
 */
router.get(
    '/plan/:lineId',
    operationMiddleware.setOperation('GET_BUS_PLAN', 'Bus'),
    busController.getBusPlanTime.bind(busController)
);

module.exports = router; 