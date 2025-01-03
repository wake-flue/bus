const ResponseHandler = require("../utils/responseHandler");
const PaginationUtils = require("../utils/paginationUtils");
const { NotFoundError } = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");

class BaseController {
    constructor(service) {
        this.service = service;
    }

    // 通用列表查询方法
    list = catchAsync(async (req, res) => {
        const paginationParams = PaginationUtils.processPaginationParams(req.query);
        const filters = PaginationUtils.cleanQueryParams(req.query);
        const result = await this.service.findWithPagination(filters, paginationParams);
        return ResponseHandler.success(res, result);
    });

    // 通用详情查询方法
    detail = catchAsync(async (req, res) => {
        const result = await this.service.findById(req.params.id);
        if (!result) {
            throw new NotFoundError("资源不存在");
        }
        return ResponseHandler.success(res, result);
    });

    // 通用创建方法
    create = catchAsync(async (req, res) => {
        const result = await this.service.create(req.body);
        return ResponseHandler.created(res, result);
    });

    // 通用更新方法
    update = catchAsync(async (req, res) => {
        const result = await this.service.update(req.params.id, req.body);
        if (!result) {
            throw new NotFoundError("资源不存在");
        }
        return ResponseHandler.success(res, result);
    });

    // 通用删除方法
    delete = catchAsync(async (req, res) => {
        const result = await this.service.delete(req.params.id);
        if (!result) {
            throw new NotFoundError("资源不存在");
        }
        return ResponseHandler.success(res, null);
    });
}

module.exports = BaseController;
