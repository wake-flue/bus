/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: Todo ID
 *           example: 507f1f77bcf86cd799439011
 *         title:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: 待办事项标题
 *           example: 完成项目文档
 *         completed:
 *           type: boolean
 *           default: false
 *           description: 完成状态
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: 2023-11-01T08:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: 2023-11-01T08:00:00Z
 *
 *     TodoList:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Todo'
 *           example:
 *             - _id: 507f1f77bcf86cd799439011
 *               title: 完成项目文档
 *               completed: false
 *               createdAt: 2023-11-01T08:00:00Z
 *               updatedAt: 2023-11-01T08:00:00Z
 *             - _id: 507f1f77bcf86cd799439012
 *               title: 代码审查
 *               completed: true
 *               createdAt: 2023-11-01T09:00:00Z
 *               updatedAt: 2023-11-01T10:00:00Z
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 总数量
 *               example: 42
 *             page:
 *               type: integer
 *               description: 当前页码
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: 每页数量
 *               example: 20
 *             totalPages:
 *               type: integer
 *               description: 总页数
 *               example: 3
 *         filters:
 *           type: object
 *           properties:
 *             completed:
 *               type: boolean
 *               description: 完成状态过滤
 *               example: false
 *             title:
 *               type: string
 *               description: 标题搜索关键词
 *               example: 文档
 *         sort:
 *           type: object
 *           properties:
 *             sortBy:
 *               type: string
 *               enum: [title, createdAt, completed]
 *               description: 排序字段
 *               example: createdAt
 *             sortOrder:
 *               type: string
 *               enum: [asc, desc]
 *               description: 排序方向
 *               example: desc
 */

/**
 * @swagger
 * /api/v1/todos:
 *   get:
 *     tags: [Todo]
 *     summary: 获取待办事项列表
 *     description: |
 *       获取待办事项列表,支持分页、排序和过滤
 *       - 分页: 通过 page 和 pageSize 参数控制
 *       - 排序: 支持按标题、创建时间、完成状态排序
 *       - 过滤: 支持按完成状态和标题关键词过滤
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/pageSizeParam'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, completed]
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序方向
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: 完成状态过滤
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 标题搜索关键词
 *     responses:
 *       200:
 *         description: 成功返回待办事项列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TodoList'
 *             examples:
 *               success:
 *                 summary: 成功示例
 *                 value:
 *                   success: true
 *                   data:
 *                     data:
 *                       - _id: 507f1f77bcf86cd799439011
 *                         title: 完成项目文档
 *                         completed: false
 *                         createdAt: 2023-11-01T08:00:00Z
 *                         updatedAt: 2023-11-01T08:00:00Z
 *                     pagination:
 *                       total: 42
 *                       page: 1
 *                       pageSize: 20
 *                       totalPages: 3
 *                     filters:
 *                       completed: false
 *                       title: 文档
 *                     sort:
 *                       sortBy: createdAt
 *                       sortOrder: desc
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               error:
 *                 summary: 错误示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 500
 *                     operation: DATABASE_ERROR
 *                     message: 数据库查询失败
 *                     details: Connection timeout
 *
 *   post:
 *     tags: [Todo]
 *     summary: 创建待办事项
 *     description: |
 *       创建新的待办事项
 *       - title: 必填,长度2-100字符
 *       - completed: 可选,默认false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: 待办事项标题
 *               completed:
 *                 type: boolean
 *                 default: false
 *                 description: 完成状态
 *           examples:
 *             todo:
 *               summary: 创建待办事项示例
 *               value:
 *                 title: 完成项目文档
 *                 completed: false
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *             examples:
 *               success:
 *                 summary: 成功示例
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: 507f1f77bcf86cd799439011
 *                     title: 完成项目文档
 *                     completed: false
 *                     createdAt: 2023-11-01T08:00:00Z
 *                     updatedAt: 2023-11-01T08:00:00Z
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validation_error:
 *                 summary: 验证错误示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     operation: VALIDATION_ERROR
 *                     message: 请求参数验证失败
 *                     details:
 *                       - field: title
 *                         message: 标题长度必须在2-100字符之间
 *                         value: a
 *
 * /api/v1/todos/{id}:
 *   get:
 *     tags: [Todo]
 *     summary: 获取待办事项详情
 *     description: 根据ID获取待办事项的详细信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: 成功返回待办事项详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *             examples:
 *               success:
 *                 summary: 成功示例
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: 507f1f77bcf86cd799439011
 *                     title: 完成项目文档
 *                     completed: false
 *                     createdAt: 2023-11-01T08:00:00Z
 *                     updatedAt: 2023-11-01T08:00:00Z
 *       400:
 *         description: 无效的ID格式
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_id:
 *                 summary: 无效ID示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     operation: BAD_REQUEST
 *                     message: 无效的ID格式
 *       404:
 *         description: 资源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               not_found:
 *                 summary: 资源不存在示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 404
 *                     operation: NOT_FOUND
 *                     message: 待办事项不存在
 *
 *   put:
 *     tags: [Todo]
 *     summary: 更新待办事项
 *     description: |
 *       更新待办事项信息
 *       - title: 可选,长度2-100字符
 *       - completed: 可选,布尔值
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: 待办事项标题
 *               completed:
 *                 type: boolean
 *                 description: 完成状态
 *           examples:
 *             update:
 *               summary: 更新待办事项示例
 *               value:
 *                 title: 更新项目文档
 *                 completed: true
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *             examples:
 *               success:
 *                 summary: 成功示例
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: 507f1f77bcf86cd799439011
 *                     title: 更新项目文档
 *                     completed: true
 *                     createdAt: 2023-11-01T08:00:00Z
 *                     updatedAt: 2023-11-01T10:00:00Z
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validation_error:
 *                 summary: 验证错误示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 400
 *                     operation: VALIDATION_ERROR
 *                     message: 请求参数验证失败
 *                     details:
 *                       - field: title
 *                         message: 标题长度必须在2-100字符之间
 *                         value: a
 *       404:
 *         description: 资源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               not_found:
 *                 summary: 资源不存在示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 404
 *                     operation: NOT_FOUND
 *                     message: 待办事项不存在
 *
 *   delete:
 *     tags: [Todo]
 *     summary: 删除待办事项
 *     description: 根据ID删除待办事项
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 待办事项删除成功
 *             examples:
 *               success:
 *                 summary: 成功示例
 *                 value:
 *                   success: true
 *                   message: 待办事项删除成功
 *       404:
 *         description: 资源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               not_found:
 *                 summary: 资源不存在示例
 *                 value:
 *                   success: false
 *                   error:
 *                     code: 404
 *                     operation: NOT_FOUND
 *                     message: 待办事项不存在
 */

module.exports = {};
