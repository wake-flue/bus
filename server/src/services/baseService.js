const PaginationUtils = require("../utils/paginationUtils");

class BaseService {
    constructor(model) {
        this.model = model;
    }

    // 基础查询方法
    async findWithPagination(query = {}, pagination = {}, validSortFields = []) {
        const { page, pageSize, sortBy, sortOrder } = pagination;
        const sort = PaginationUtils.buildSortObject(sortBy, sortOrder, validSortFields);

        const total = await this.model.countDocuments(query);
        const data = await this.model
            .find(query)
            .sort(sort)
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        return {
            data,
            pagination: {
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize),
            },
            sort: {
                sortBy,
                sortOrder,
            },
        };
    }

    // 基础CRUD操作
    async create(data) {
        const doc = new this.model(data);
        return await doc.save();
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async findById(id) {
        return await this.model.findById(id);
    }
}

module.exports = BaseService;
