const { body, param } = require("express-validator");
const mongoose = require("mongoose");
const { BadRequestError } = require("../utils/apiError");

const userValidation = {
    // 注册验证
    register: [
        body("email").trim().isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
        body("password")
            .isLength({ min: 6 })
            .withMessage("密码至少需要6个字符")
            .matches(/\d/)
            .withMessage("密码必须包含数字")
            .matches(/[a-zA-Z]/)
            .withMessage("密码必须包含字母"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("用户名不能为空")
            .isLength({ min: 2, max: 30 })
            .withMessage("用户名长度必须在2-30个字符之间"),
    ],

    // 登录验证
    login: [
        body("email").trim().isEmail().withMessage("请输入有效的邮箱地址").normalizeEmail(),
        body("password").notEmpty().withMessage("密码不能为空"),
    ],

    // 更新个人信息验证
    updateProfile: [
        body("name")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("用户名不能为空")
            .isLength({ min: 2, max: 30 })
            .withMessage("用户名长度必须在2-30个字符之间"),
        body("email")
            .optional()
            .trim()
            .isEmail()
            .withMessage("请输入有效的邮箱地址")
            .normalizeEmail(),
    ],

    // 修改密码验证
    changePassword: [
        body("oldPassword").notEmpty().withMessage("原密码不能为空"),
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("新密码至少需要6个字符")
            .matches(/\d/)
            .withMessage("新密码必须包含数字")
            .matches(/[a-zA-Z]/)
            .withMessage("新密码必须包含字母")
            .custom((value, { req }) => {
                if (value === req.body.oldPassword) {
                    throw new BadRequestError("新密码不能与原密码相同");
                }
                return true;
            }),
    ],

    // 获取用户验证
    getUserById: [
        param("id").custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new BadRequestError("无效的用户ID");
            }
            return true;
        }),
    ],
};

module.exports = {
    userValidation,
};
