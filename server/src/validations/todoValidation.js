const { body, param } = require("express-validator");
const mongoose = require("mongoose");
const { BadRequestError } = require("../utils/apiError");

const todoValidation = {
    // 创建todo验证
    createTodo: [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("标题不能为空")
            .isLength({ min: 2, max: 100 })
            .withMessage("标题长度必须在2-100个字符之间")
            .isString()
            .withMessage("标题必须是字符串类型"),
        body("completed").optional().isBoolean().withMessage("completed必须是布尔值"),
    ],

    // 更新todo验证
    updateTodo: [
        param("id").custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new BadRequestError("无效的ID格式");
            }
            return true;
        }),
        body("title")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("标题不能为空")
            .isLength({ min: 2, max: 100 })
            .withMessage("标题长度必须在2-100个字符之间")
            .isString()
            .withMessage("标题必须是字符串类型"),
        body("completed").optional().isBoolean().withMessage("completed必须是布尔值"),
    ],

    // 获取/删除todo验证
    todoById: [
        param("id").custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new BadRequestError("无效的ID格式");
            }
            return true;
        }),
    ],
};

module.exports = {
    todoValidation,
};
