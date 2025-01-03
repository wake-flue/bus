const winston = require("winston");
require("winston-mongodb");
require("winston-daily-rotate-file");
const path = require("path");

class LogStorage {
    constructor(config) {
        this.config = config;
        this.logger = this.createLogger();
    }

    formatLogEntry(info) {
        const { timestamp, level, message, ...metadata } = info;

        // 从 metadata 中移除重复的字段
        const {
            timestamp: metaTimestamp,
            level: metaLevel,
            message: metaMessage,
            type,
            ...cleanMetadata
        } = metadata;

        return {
            timestamp,
            level,
            message,
            meta: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null,
        };
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }

    createConsoleTransport() {
        return new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize({ all: true }),
                winston.format.printf((info) => {
                    const { timestamp, level, message, duration, operation, resourceType, meta } =
                        info;
                    let logMessage = `[${this.formatTimestamp(timestamp)}] `;

                    // 添加resourceType信息
                    if (resourceType) {
                        logMessage += `\x1b[96m[${resourceType}]\x1b[0m\t`;
                    }

                    // 添加operation信息
                    if (operation || (meta && meta.operation)) {
                        const op = operation || meta.operation;
                        logMessage += `\x1b[96m[${op}]\x1b[0m\t`;
                    }

                    // 添加日志级别
                    logMessage += `[${level}]`;

                    // 添加消息
                    logMessage += ` : ${message}`;

                    // 添加关键性能指标
                    if (duration) {
                        logMessage += ` (${duration}ms)`;
                    }

                    return logMessage;
                }),
            ),
        });
    }

    createFileTransport() {
        return new winston.transports.DailyRotateFile({
            dirname: path.join(process.cwd(), this.config.LOG_FILE_PATH),
            filename: "app-%DATE%.log",
            datePattern: this.config.LOG_DATE_PATTERN,
            maxSize: this.config.LOG_MAX_SIZE,
            maxFiles: this.config.LOG_MAX_FILES,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((info) => JSON.stringify(this.formatLogEntry(info))),
            ),
        });
    }

    createMongoTransport() {
        const mongoFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.metadata({ fillWith: ["operation", "source", "environment"] }),
            winston.format((info) => {
                const { timestamp, level, message, metadata, type, ...rest } = info;
                return {
                    timestamp,
                    level,
                    message,
                    meta: {
                        ...metadata,
                        ...rest,
                    },
                };
            })(),
        );

        return new winston.transports.MongoDB({
            db: this.config.MONGODB_URI,
            collection: this.config.LOG_MONGODB_COLLECTION,
            options: {
                useUnifiedTopology: true,
            },
            metaKey: "meta",
            format: mongoFormat,
        });
    }

    createLogger() {
        const logTransports = [];
        const storageType = this.config.LOG_STORAGE_TYPE.toLowerCase();

        // 开发环境添加控制台输出
        if (this.config.NODE_ENV === "development") {
            logTransports.push(this.createConsoleTransport());
        }

        // 根据配置添加存储方式
        if (storageType === "file" || storageType === "both") {
            logTransports.push(this.createFileTransport());
        }

        if (storageType === "mongodb" || storageType === "both") {
            logTransports.push(this.createMongoTransport());
        }

        return winston.createLogger({
            level: this.config.LOG_LEVEL,
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                http: 3,
                debug: 4,
            },
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            transports: logTransports,
            exitOnError: false,
        });
    }

    getLogger() {
        return this.logger;
    }
}

module.exports = LogStorage;
