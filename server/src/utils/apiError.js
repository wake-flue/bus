const { HTTP_STATUS } = require("../constants/httpStatus");
/**
 * 自定义 API 错误类
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = "未授权访问") {
        super(HTTP_STATUS.UNAUTHORIZED, message);
        this.name = "UnauthorizedError";
    }
}

class ForbiddenError extends ApiError {
    constructor(message = "无权限访问") {
        super(HTTP_STATUS.FORBIDDEN, message);
        this.name = "ForbiddenError";
    }
}

class NotFoundError extends ApiError {
    constructor(message = "资源未找到") {
        super(HTTP_STATUS.NOT_FOUND, message);
        this.name = "NotFoundError";
    }
}

class BadRequestError extends ApiError {
    constructor(message = "请求参数错误") {
        super(HTTP_STATUS.BAD_REQUEST, message);
        this.name = "BadRequestError";
    }
}

class ValidationError extends ApiError {
    constructor(message = "验证错误", errors = []) {
        super(HTTP_STATUS.BAD_REQUEST, message);
        this.name = "ValidationError";
        this.errors = errors;
    }
}

module.exports = {
    ApiError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    BadRequestError,
    ValidationError,
};
