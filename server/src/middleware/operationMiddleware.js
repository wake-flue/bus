const generateOperation = (req) => {
    // 如果路由中已经定义了operation,则使用已定义的
    if (req.route && req.route.operation) {
        return req.route.operation;
    }

    // 根据HTTP方法和路径自动生成operation
    const method = req.method.toLowerCase();
    const path = req.route ? req.route.path : req.path;

    // 移除路径中的参数占位符和api/v1前缀
    const cleanPath = path
        .replace(/^\/api\/v1/, "") // 移除api/v1前缀
        .replace(/:[^/]+/g, "")
        .replace(/\//g, "_");

    // 生成operation格式: METHOD_PATH (大写)
    // 例如: GET_USERS, POST_USERS_CREATE
    return `${method}${cleanPath}`.toUpperCase();
};

const operationMiddleware = (options = {}) => {
    return (req, res, next) => {
        // 设置operation
        if (options.operation) {
            req.operation = options.operation;
        } else {
            req.operation = generateOperation(req);
        }

        // 设置resourceType
        if (options.resourceType) {
            req.resourceType = options.resourceType;
        }

        next();
    };
};

// 用于在路由定义时设置operation和resourceType的辅助函数
operationMiddleware.setOperation = (operation, resourceType) => {
    return operationMiddleware({ operation, resourceType });
};

module.exports = operationMiddleware;
