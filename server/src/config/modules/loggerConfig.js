const LogStorage = require("../../utils/logStorage");

const loggerConfig = {
    level: process.env.LOG_LEVEL || "debug",
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        debug: "blue",
    },
    // 日志存储配置
    storage: {
        type: process.env.LOG_STORAGE_TYPE || "file",
        file: {
            path: process.env.LOG_FILE_PATH || "logs",
            datePattern: process.env.LOG_DATE_PATTERN || "YYYY-MM-DD",
            maxSize: process.env.LOG_MAX_SIZE || "20m",
            maxFiles: process.env.LOG_MAX_FILES || "14d",
        },
        mongodb: {
            uri: process.env.MONGODB_URI,
            collection: process.env.LOG_MONGODB_COLLECTION || "logs",
            capSize: process.env.LOG_MONGODB_CAP_SIZE || 100000000,
            capMax: process.env.LOG_MONGODB_CAP_MAX || 5000,
            expireAfterSeconds: process.env.LOG_MONGODB_EXPIRE_AFTER_SECONDS || 2592000,
        },
    },
};

// 创建日志存储实例
const logStorage = new LogStorage({
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: loggerConfig.level,
    LOG_STORAGE_TYPE: loggerConfig.storage.type,
    LOG_FILE_PATH: loggerConfig.storage.file.path,
    LOG_DATE_PATTERN: loggerConfig.storage.file.datePattern,
    LOG_MAX_SIZE: loggerConfig.storage.file.maxSize,
    LOG_MAX_FILES: loggerConfig.storage.file.maxFiles,
    MONGODB_URI: loggerConfig.storage.mongodb.uri,
    LOG_MONGODB_COLLECTION: loggerConfig.storage.mongodb.collection,
    LOG_MONGODB_CAP_SIZE: loggerConfig.storage.mongodb.capSize,
    LOG_MONGODB_CAP_MAX: loggerConfig.storage.mongodb.capMax,
    LOG_MONGODB_EXPIRE_AFTER_SECONDS: loggerConfig.storage.mongodb.expireAfterSeconds,
});

// 获取配置好的 loggerConfig 实例
const logger = logStorage.getLogger();

// 添加颜色支持
logger.colors = loggerConfig.colors;
logger.levels = loggerConfig.levels;

module.exports = logger;
