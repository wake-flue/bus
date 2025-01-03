//===========================
// 依赖导入
//===========================
// 核心依赖
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Swagger文档
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// 自定义模块
const config = require("./config");
const LogHandler = require("./utils/logHandler");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const operationMiddleware = require("./middleware/operationMiddleware");

//===========================
// 应用初始化
//===========================
const app = express();
const { port, apiVersion, corsOrigin } = config.app;

//===========================
// 数据库连接
//===========================
config.db
    .connectDB()
    .then(() => {
        LogHandler.info("MongoDB连接成功", {
            operation: "DB_CONNECT",
            resourceType: "MongoDB",
            database: "MongoDB",
            status: "success",
        });
    })
    .catch((err) => {
        LogHandler.error("MongoDB连接失败", {
            operation: "DB_CONNECT",
            resourceType: "MongoDB",
            database: "MongoDB",
            status: "failed",
            error: err,
        });
    });

//===========================
// Swagger配置
//===========================
const swaggerSpec = swaggerJsdoc(config.swagger);

// Swagger路由
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get(`/api/${apiVersion}/docs.json`, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

//===========================
// 中间件注册
//===========================
// 通用中间件
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(operationMiddleware());
app.use(loggerMiddleware);

//===========================
// API路由注册
//===========================
const todosRouter = require("./api/todosApi");
const logsRouter = require("./api/logsApi");
const usersRouter = require("./api/usersApi");

app.use(`/api/${apiVersion}/todos`, todosRouter);
app.use(`/api/${apiVersion}/logs`, logsRouter);
app.use(`/api/${apiVersion}/users`, usersRouter);

//===========================
// 错误处理
//===========================
app.use(errorHandler); // 500错误处理
app.use(notFoundHandler); // 404错误处理

//===========================
// 启动服务器
//===========================
// 仅在直接运行时启动服务器
if (require.main === module) {
    app.listen(port, () => {
        LogHandler.info(
            `服务器启动成功\t访问地址：http://localhost:${port}/api/${apiVersion}\t文档地址：http://localhost:${port}/api-docs`,
            {
                operation: "SERVER_START",
                port,
                environment: process.env.NODE_ENV,
                apiVersion,
                resourceType: "Server",
                urls: {
                    api: `http://localhost:${port}/api/${apiVersion}`,
                    docs: `http://localhost:${port}/api-docs`,
                },
            },
        );
    });
}

// 导出 app 实例供测试使用
module.exports = app;
