const Todo = require("../models/todoModel");
const BaseService = require("./baseService");
const PaginationUtils = require("../utils/paginationUtils");

class TodoService extends BaseService {
    constructor() {
        super(Todo);
        this.validSortFields = ["title", "createdAt", "completed"];
    }

    // 构建Todo查询条件
    _buildTodoQuery(filters = {}) {
        const query = {};
        const cleanFilters = PaginationUtils.cleanQueryParams(filters);

        if (cleanFilters.completed !== undefined) {
            query.completed = cleanFilters.completed === "true";
        }
        if (cleanFilters.title) {
            query.title = { $regex: cleanFilters.title, $options: "i" };
        }

        return query;
    }

    async findWithPagination(filters = {}, pagination = {}) {
        const query = this._buildTodoQuery(filters);
        const result = await super.findWithPagination(query, pagination, this.validSortFields);
        return {
            ...result,
            filters: PaginationUtils.cleanQueryParams(filters),
        };
    }

    async create(todoData) {
        return await super.create({
            title: todoData.title,
            completed: todoData.completed || false,
        });
    }

    async update(id, todoData) {
        const updateData = {
            title: todoData.title,
            completed: todoData.completed,
        };

        // 移除未定义的字段
        Object.keys(updateData).forEach(
            (key) => updateData[key] === undefined && delete updateData[key],
        );

        return await super.update(id, updateData);
    }
}

module.exports = new TodoService();
