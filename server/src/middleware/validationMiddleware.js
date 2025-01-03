const { validationResult } = require("express-validator");
const { ValidationError } = require("../utils/apiError");

/**
 * 验证中间件
 * 用于处理express-validator的验证结果
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // 执行所有验证
        await Promise.all(validations.map((validation) => validation.run(req)));

        // 获取验证结果
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // 格式化错误信息
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
            value: err.value,
        }));

        // 使用ValidationError处理验证错误
        next(new ValidationError(formattedErrors[0].message, formattedErrors));
    };
};

module.exports = {
    validate,
};
