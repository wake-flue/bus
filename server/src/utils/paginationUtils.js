const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

class PaginationUtils {
    /**
     * 处理分页参数
     * @param {Object} query 查询参数对象
     * @returns {Object} 标准化的分页参数
     */
    static processPaginationParams(query = {}) {
        const {
            page = DEFAULT_PAGE,
            pageSize = DEFAULT_PAGE_SIZE,
            sortBy = DEFAULT_SORT_BY,
            sortOrder = DEFAULT_SORT_ORDER,
        } = query;

        return {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            sortBy,
            sortOrder,
        };
    }

    /**
     * 清理查询参数中的分页相关字段
     * @param {Object} query 查询参数对象
     * @returns {Object} 清理后的查询参数
     */
    static cleanQueryParams(query = {}) {
        const cleanQuery = { ...query };
        ["page", "pageSize", "sortBy", "sortOrder"].forEach((param) => delete cleanQuery[param]);
        return cleanQuery;
    }

    /**
     * 构建排序对象
     * @param {string} sortBy 排序字段
     * @param {string} sortOrder 排序方向
     * @param {Array} validSortFields 有效的排序字段列表
     * @returns {Object} Mongoose 排序对象
     */
    static buildSortObject(
        sortBy = DEFAULT_SORT_BY,
        sortOrder = DEFAULT_SORT_ORDER,
        validSortFields = [],
    ) {
        const finalSortBy = validSortFields.includes(sortBy) ? sortBy : DEFAULT_SORT_BY;
        const finalSortOrder =
            sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase())
                ? sortOrder.toLowerCase()
                : DEFAULT_SORT_ORDER;

        return {
            [finalSortBy]: finalSortOrder === "desc" ? -1 : 1,
        };
    }
}

module.exports = PaginationUtils;
