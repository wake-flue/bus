const LogHandler = require("../utils/logHandler");
const {
    HTTP_STATUS,
    OPERATIONS,
    STATUS_TO_OPERATION,
    RESOURCE_TYPES,
} = require("../constants/httpStatus");

const loggerMiddleware = (req, res, next) => {
    const start = new Date();
    let error = null;

    // 捕获原始的res.end以便注入错误处理
    const originalEnd = res.end;

    // 重写res.end以捕获错误
    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        const duration = new Date() - start;

        const requestInfo = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            headers: req.headers,
            query: req.query,
        };

        const responseInfo = {
            status: res.statusCode,
            message: res.statusMessage,
            duration,
        };

        // 根据状态码设置特定的operation
        let operation = req.operation;
        if (res.statusCode >= HTTP_STATUS.BAD_REQUEST) {
            // 使用映射关系获取对应的operation，如果没有则使用默认值
            operation =
                STATUS_TO_OPERATION[res.statusCode] ||
                (res.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR
                    ? OPERATIONS.ERROR_HANDLER
                    : OPERATIONS.BAD_REQUEST);
        }

        // 获取resourceType
        let resourceType = req.resourceType;
        if (!resourceType) {
            resourceType =
                res.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR
                    ? RESOURCE_TYPES.SERVER_ERROR
                    : res.statusCode >= HTTP_STATUS.BAD_REQUEST
                      ? RESOURCE_TYPES.CLIENT_ERROR
                      : RESOURCE_TYPES.SERVER;
        }

        // 获取业务错误
        error = res.locals.error || error;

        const metadata = {
            operation: operation,
            resourceType: resourceType,
            error: error,
        };

        LogHandler.logRequest(requestInfo, responseInfo, metadata);
    };

    // 错误处理
    res.on("error", (err) => {
        error = err;
    });

    try {
        next();
    } catch (err) {
        error = err;
        next(err);
    }
};

module.exports = loggerMiddleware;
