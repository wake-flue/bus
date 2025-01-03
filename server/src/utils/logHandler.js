const config = require("../config");
const logger = config.logger;
const { HTTP_STATUS } = require("../constants/httpStatus");

class LogHandler {
    static formatMetadata(metadata = {}) {
        // 移除空值、未定义的字段和重复字段
        const cleanMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
            if (
                value !== null &&
                value !== undefined &&
                key !== "responseData" &&
                key !== "timestamp" &&
                key !== "level" &&
                key !== "message" &&
                key !== "meta" &&
                key !== "type"
            ) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // 移除空值的字段
        return Object.entries({
            source: "backend",
            environment: process.env.NODE_ENV,
            ...cleanMetadata,
        }).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }

    static formatError(error) {
        if (!error) return null;
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error.code && { code: error.code }),
            ...(error.status && { status: error.status }),
        };
    }

    static logRequest(requestInfo, responseInfo, metadata = {}) {
        const message = `${requestInfo.method} ${requestInfo.url} ${responseInfo.status} ${responseInfo.duration}ms`;

        const logData = {
            requestInfo,
            responseInfo,
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };

        // 处理错误信息
        if (metadata.error) {
            logData.error = this.formatError(metadata.error);
        }

        if (responseInfo.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
            // 对于500错误,如果没有显式的错误信息,创建一个
            if (!logData.error) {
                logData.error = this.formatError(
                    new Error(`Internal Server Error: ${responseInfo.message || "Unknown error"}`),
                );
            }
            logger.error(message, logData);
        } else if (responseInfo.status >= HTTP_STATUS.BAD_REQUEST) {
            // 对于400错误,如果没有显式的错误信息,创建一个
            if (!logData.error) {
                logData.error = this.formatError(
                    new Error(`Client Error: ${responseInfo.message || "Bad Request"}`),
                );
            }
            logger.warn(message, logData);
        } else {
            logger.info(message, logData);
        }
    }

    static error(message, metadata = {}) {
        const logData = {
            error: this.formatError(metadata.error),
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };
        logger.error(message, logData);
    }

    static warn(message, metadata = {}) {
        const logData = {
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };
        logger.warn(message, logData);
    }

    static info(message, metadata = {}) {
        const logData = {
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };
        logger.info(message, logData);
    }

    static http(message, metadata = {}) {
        const logData = {
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };
        logger.http(message, logData);
    }

    static debug(message, metadata = {}) {
        const logData = {
            operation: metadata.operation,
            resourceType: metadata.resourceType,
            ...this.formatMetadata(metadata),
        };
        logger.debug(message, logData);
    }
}

module.exports = LogHandler;
