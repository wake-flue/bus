/**
 * 包装异步路由处理器的工具函数
 * 自动捕获异步错误并传递给错误处理中间件
 * @param {Function} fn 异步路由处理器
 * @returns {Function} Express 中间件函数
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync;
