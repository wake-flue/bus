const userService = require("../services/userService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");
const PaginationUtils = require("../utils/paginationUtils");
const { UnauthorizedError, NotFoundError } = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    /**
     * 用户注册
     */
    register = catchAsync(async (req, res) => {
        const user = await this.service.createUser(req.body);
        return ResponseHandler.created(res, { user });
    });

    /**
     * 用户登录
     */
    login = catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const userAgent = req.headers["user-agent"];
        const ipAddress = req.ip;

        const { user, accessToken, refreshToken } = await this.service.loginUser(
            email,
            password,
            userAgent,
            ipAddress,
        );

        // 设置刷新令牌cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
        });

        return ResponseHandler.success(res, {
            user,
            accessToken,
        });
    });

    /**
     * 刷新访问令牌
     */
    refreshToken = catchAsync(async (req, res) => {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new UnauthorizedError("请先登录");
        }

        const userAgent = req.headers["user-agent"];
        const ipAddress = req.ip;

        const { accessToken } = await this.service.refreshToken(refreshToken, userAgent, ipAddress);

        return ResponseHandler.success(res, { accessToken });
    });

    /**
     * 退出登录
     */
    logout = catchAsync(async (req, res) => {
        res.clearCookie("refreshToken");
        return ResponseHandler.success(res, { message: "退出登录成功" });
    });

    /**
     * 获取当前用户信息
     */
    getProfile = catchAsync(async (req, res) => {
        const user = await this.service.getUserById(req.user.id);
        return ResponseHandler.success(res, { user });
    });

    /**
     * 更新当前用户信息
     */
    updateProfile = catchAsync(async (req, res) => {
        const user = await this.service.updateUser(req.user.id, req.body);
        return ResponseHandler.success(res, { user });
    });

    /**
     * 修改密码
     */
    changePassword = catchAsync(async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const result = await this.service.changePassword(req.user.id, oldPassword, newPassword);
        return ResponseHandler.success(res, result);
    });

    /**
     * 管理员: 获取用户列表
     */
    getUsers = catchAsync(async (req, res) => {
        const paginationParams = PaginationUtils.processPaginationParams(req.query);
        const filters = PaginationUtils.cleanQueryParams(req.query);
        const result = await this.service.findWithPagination(filters, paginationParams);
        return ResponseHandler.success(res, result);
    });

    /**
     * 管理员: 获取指定用户信息
     */
    getUser = catchAsync(async (req, res) => {
        const user = await this.service.findById(req.params.id);
        if (!user) {
            throw new NotFoundError("用户不存在");
        }
        return ResponseHandler.success(res, { user });
    });
}

module.exports = new UserController();
