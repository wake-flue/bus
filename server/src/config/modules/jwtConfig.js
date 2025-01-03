const jwtConfig = {
    // Access Token 配置
    secret: process.env.JWT_SECRET || "your-development-secret-key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h", // 访问令牌有效期1小时

    // Refresh Token 配置
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // 刷新令牌有效期7天
};

module.exports = jwtConfig;
