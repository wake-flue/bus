const path = require("path");
require("dotenv").config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
});

const appConfig = require("./modules/appConfig");
const dbConfig = require("./modules/dbConfig");
const loggerConfig = require("./modules/loggerConfig");
const swaggerConfig = require("./modules/swaggerConfig");
const jwtConfig = require("./modules/jwtConfig");

const config = {
    app: appConfig,
    db: dbConfig,
    logger: loggerConfig,
    swagger: swaggerConfig,
    jwt: jwtConfig,
};

module.exports = config;
