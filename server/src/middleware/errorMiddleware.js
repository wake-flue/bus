const { HTTP_STATUS } = require("../constants/httpStatus");

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    // 设置错误信息到 res.locals 供 loggerMiddleware 使用
    res.locals.error = {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };

    // 处理未授权错误
    if (err.name === "UnauthorizedError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: err.message || "未授权访问",
        });
    }

    // 处理mongoose验证错误
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => error.message);
        // 记录验证错误的详细信息
        res.locals.error = {
            ...res.locals.error,
            type: "ValidationError",
            errors: errors,
            fields: Object.keys(err.errors).reduce((acc, key) => {
                acc[key] = {
                    message: err.errors[key].message,
                    value: err.errors[key].value,
                    type: err.errors[key].kind,
                };
                return acc;
            }, {}),
        };

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `验证失败: ${errors[0]}`,
            errors: errors,
        });
    }

    // 处理mongoose CastError (无效的ObjectId)
    if (err.name === "CastError") {
        // 记录CastError的详细信息
        res.locals.error = {
            ...res.locals.error,
            type: "CastError",
            value: err.value,
            path: err.path,
            kind: err.kind,
        };

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: "无效的ID格式",
            error: err.message,
        });
    }

    // 处理自定义API错误
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // 默认500错误
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: process.env.NODE_ENV === "development" ? err.message : "服务器内部错误",
    });
};

// 404错误处理中间件
const notFoundHandler = (req, res) => {
    // 记录404错误
    res.locals.error = {
        type: "NotFoundError",
        message: "请求的资源不存在",
        path: req.originalUrl,
    };

    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "请求的资源不存在",
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
