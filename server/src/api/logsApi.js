const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const operationMiddleware = require("../middleware/operationMiddleware");

/**
 * 查询日志
 */
router.get(
    "/",
    operationMiddleware.setOperation("GET_LOGS", "Log"),
    logController.list.bind(logController),
);

/**
 * 获取日志详情
 */
router.get(
    "/:id",
    operationMiddleware.setOperation("GET_LOG_DETAIL", "Log"),
    logController.detail.bind(logController),
);

/**
 * 创建日志
 */
router.post(
    "/",
    operationMiddleware.setOperation("CREATE_LOGS", "Log"),
    logController.create.bind(logController),
);

module.exports = router;
