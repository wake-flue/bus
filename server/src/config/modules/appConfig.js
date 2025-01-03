const appConfig = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3001,
    apiVersion: process.env.API_VERSION || "v1",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
};

module.exports = appConfig;
