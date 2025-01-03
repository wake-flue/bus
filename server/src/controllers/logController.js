const logService = require("../services/logService");
const ResponseHandler = require("../utils/responseHandler");
const BaseController = require("./baseController");
const PaginationUtils = require("../utils/paginationUtils");
const { BadRequestError } = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");

class LogController extends BaseController {
    constructor() {
        super(logService);
    }

    list = catchAsync(async (req, res) => {
        const { status, ...query } = req.query;
        const paginationParams = PaginationUtils.processPaginationParams(query);
        const filters = PaginationUtils.cleanQueryParams(query);

        if (status) {
            filters.status = parseInt(status);
        }

        const result = await this.service.findWithPagination(filters, paginationParams);
        return ResponseHandler.success(res, result);
    });

    create = catchAsync(async (req, res) => {
        const logs = req.body;

        if (!Array.isArray(logs)) {
            throw new BadRequestError("日志格式错误, 应为数组");
        }

        const result = await this.service.create(logs);
        return ResponseHandler.created(res, result);
    });
}

module.exports = new LogController();
