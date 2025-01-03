const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const jwt = require("jsonwebtoken");
const config = require("../config");
const {
    BadRequestError,
    ForbiddenError,
    UnauthorizedError,
    NotFoundError,
} = require("../utils/apiError");
const BaseService = require("./baseService");
const { parseDuration } = require("../utils/durationParser");

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    /**
     * 创建用户
     */
    async createUser(userData) {
        const existingUser = await this.model.findOne({ email: userData.email });
        if (existingUser) {
            throw new BadRequestError("该邮箱已被注册");
        }

        const user = await this.create(userData);
        // 确保返回的用户对象不包含密码字段
        return await this.model.findById(user._id);
    }

    /**
     * 用户登录
     */
    async loginUser(email, password, userAgent, ipAddress) {
        const user = await this.model.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            throw new UnauthorizedError("邮箱或密码错误");
        }

        if (!user.isActive) {
            throw new ForbiddenError("账户已被禁用");
        }

        // 生成访问令牌
        const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiresIn,
        });

        // 生成刷新令牌
        const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });

        // 计算刷新令牌过期时间
        const refreshExpiresMs = parseDuration(config.jwt.refreshExpiresIn);
        const expiresDate = new Date(Date.now() + refreshExpiresMs);

        // 保存刷新令牌
        await Token.create({
            userId: user._id,
            token: refreshToken,
            expires: expiresDate,
            userAgent,
            ipAddress,
        });

        // 更新最后登录时间
        user.lastLogin = new Date();
        await user.save();

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    /**
     * 刷新访问令牌
     */
    async refreshToken(refreshToken, userAgent, ipAddress) {
        const tokenDoc = await Token.findOne({ token: refreshToken });
        if (!tokenDoc || !tokenDoc.isValid()) {
            throw new UnauthorizedError("无效的刷新令牌");
        }

        const user = await this.findById(tokenDoc.userId);
        if (!user || !user.isActive) {
            throw new UnauthorizedError("用户不存在或已被禁用");
        }

        // 生成新的访问令牌
        const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiresIn,
        });

        return { accessToken };
    }

    /**
     * 获取用户信息
     */
    async getUserById(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundError("用户不存在");
        }
        return user;
    }

    /**
     * 更新用户信息
     */
    async updateUser(userId, updateData) {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundError("用户不存在");
        }

        // 防止更新敏感字段
        delete updateData.password;
        delete updateData.role;

        Object.assign(user, updateData);
        await user.save();
        return user;
    }

    /**
     * 修改密码
     */
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.model.findById(userId).select("+password");
        if (!user) {
            throw new NotFoundError("用户不存在");
        }

        if (!(await user.comparePassword(oldPassword))) {
            throw new BadRequestError("原密码错误");
        }

        user.password = newPassword;
        await user.save();

        // 撤销所有刷新令牌
        await Token.updateMany({ userId: user._id }, { isRevoked: true });

        return { message: "密码修改成功" };
    }

    /**
     * 重写父类的findWithPagination方法，添加自定义过滤
     */
    async findWithPagination(filters = {}, options = {}) {
        // 移除密码字段
        return await super.findWithPagination(filters, {
            ...options,
            select: "-password",
        });
    }
}

module.exports = new UserService();
