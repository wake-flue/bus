const jwt = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError, ForbiddenError } = require("../utils/apiError");
const User = require("../models/userModel");

/**
 * 认证中间件
 */
const authenticate = async (req, res, next) => {
    try {
        // 获取token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new UnauthorizedError("请先登录"));
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(new UnauthorizedError("请先登录"));
        }

        // 验证token
        const decoded = jwt.verify(token, config.jwt.secret);
        if (!decoded) {
            return next(new UnauthorizedError("无效的访问令牌"));
        }

        // 检查用户是否存在
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new UnauthorizedError("用户不存在"));
        }

        if (!user.isActive) {
            return next(new UnauthorizedError("账户已被禁用"));
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            next(new UnauthorizedError("无效的访问令牌"));
        } else if (error.name === "TokenExpiredError") {
            next(new UnauthorizedError("访问令牌已过期"));
        } else {
            next(error);
        }
    }
};

/**
 * 角色限制中间件
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError("无权限访问此资源"));
        }
        next();
    };
};

module.exports = {
    authenticate,
    restrictTo,
};
