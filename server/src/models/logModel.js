const mongoose = require("mongoose");
const config = require("../config");
const COLLECTIONS = config.db.collections;

const LOG_LEVELS = Object.keys(config.logger.levels);
const SOURCES = ["frontend", "backend"];
const ENVIRONMENTS = ["development", "production"];

const logSchema = new mongoose.Schema(
    {
        // 基础日志信息
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        level: {
            type: String,
            required: true,
            enum: LOG_LEVELS,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },

        // 元数据
        meta: {
            operation: String,
            model: String,
            source: {
                type: String,
                enum: SOURCES,
                required: true,
                index: true,
            },
            environment: {
                type: String,
                required: true,
                enum: ENVIRONMENTS,
                default: process.env.NODE_ENV || "development",
                index: true,
            },

            // HTTP 请求信息
            requestInfo: {
                method: String,
                url: String,
                ip: String,
                headers: mongoose.Schema.Types.Mixed,
                query: mongoose.Schema.Types.Mixed,
            },

            // HTTP 响应信息
            responseInfo: {
                status: {
                    type: Number,
                    index: true,
                },
                message: String,
                duration: Number,
            },

            // 错误信息
            error: {
                name: {
                    type: String,
                    index: true,
                },
                message: String,
                stack: String,
            },

            // 客户端信息
            client: {
                browser: String,
                os: String,
                device: String,
                url: String,
            },

            // 其他动态元数据
            additionalData: mongoose.Schema.Types.Mixed,
        },
    },
    {
        minimize: false,
    },
);

// 优化复合索引
logSchema.index({ timestamp: -1, "meta.source": 1, level: 1 });
logSchema.index({ timestamp: -1, "meta.environment": 1 });
logSchema.index({ "request.status": 1, timestamp: -1 });

const LogModel = mongoose.model(COLLECTIONS.LOGS, logSchema);

module.exports = LogModel;
