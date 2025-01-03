/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       required:
 *         - level
 *         - message
 *         - meta
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 日志时间戳 (默认为当前时间，已建立索引)
 *         level:
 *           type: string
 *           enum: [error, warn, info, http, verbose, debug, silly]
 *           description: 日志级别 (已建立索引)
 *         message:
 *           type: string
 *           description: 日志消息
 *         meta:
 *           type: object
 *           required:
 *             - source
 *             - environment
 *           properties:
 *             operation:
 *               type: string
 *               description: 操作类型 (如：create, update, delete等)
 *             model:
 *               type: string
 *               description: 相关模型名称 (可选)
 *             source:
 *               type: string
 *               enum: [frontend, backend]
 *               description: 日志来源 (已建立索引)
 *             environment:
 *               type: string
 *               enum: [development, production]
 *               description: 运行环境 (已建立索引，默认从NODE_ENV获取)
 *             requestInfo:
 *               type: object
 *               properties:
 *                 method:
 *                   type: string
 *                   description: HTTP方法
 *                 url:
 *                   type: string
 *                   description: 请求URL
 *                 ip:
 *                   type: string
 *                   description: 客户端IP
 *                 headers:
 *                   type: object
 *                   description: 请求头信息
 *                 query:
 *                   type: object
 *                   description: URL查询参数
 *             responseInfo:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP状态码 (已建立索引)
 *                 message:
 *                   type: string
 *                   description: 响应消息
 *                 duration:
 *                   type: number
 *                   description: 请求处理时间(ms)
 *             error:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: 错误类型名称 (已建立索引)
 *                 message:
 *                   type: string
 *                   description: 错误消息
 *                 stack:
 *                   type: string
 *                   description: 错误堆栈信息
 *             client:
 *               type: object
 *               properties:
 *                 browser:
 *                   type: string
 *                   description: 浏览器信息
 *                 os:
 *                   type: string
 *                   description: 操作系统信息
 *                 device:
 *                   type: string
 *                   description: 设备信息
 *                 url:
 *                   type: string
 *                   description: 客户端当前URL
 *             additionalData:
 *               type: object
 *               description: 其他自定义元数据
 *
 *     LogList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *           description: 请求是否成功
 *         data:
 *           type: object
 *           properties:
 *             docs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Log'
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: 总记录数
 *                 page:
 *                   type: integer
 *                   description: 当前页码
 *                 pageSize:
 *                   type: integer
 *                   description: 每页记录数
 *                 totalPages:
 *                   type: integer
 *                   description: 总页数
 *             filters:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   description: 日志级别过滤
 *                 source:
 *                   type: string
 *                   description: 来源过滤
 *                 status:
 *                   type: integer
 *                   description: HTTP状态码过滤
 *                 operation:
 *                   type: string
 *                   description: 操作类型过滤
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   description: 开始时间
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   description: 结束时间
 *                 search:
 *                   type: string
 *                   description: 消息内容搜索
 *                 environment:
 *                   type: string
 *                   description: 环境过滤
 *
 * /api/v1/logs:
 *   get:
 *     tags: [Log]
 *     summary: 获取日志列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页记录数
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [timestamp, level]
 *           default: timestamp
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序方向
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, http, verbose, debug, silly]
 *         description: 日志级别过滤
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [frontend, backend]
 *         description: 来源过滤
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: HTTP状态码过滤
 *       - in: query
 *         name: operation
 *         schema:
 *           type: string
 *         description: 操作类型过滤
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束时间
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 消息内容搜索
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [development, production]
 *         description: 环境过滤
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogList'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                     details:
 *                       type: object
 *                       description: 详细错误信息
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                     stack:
 *                       type: string
 *                       description: 错误堆栈(仅开发环境)
 *
 *   post:
 *     tags: [Log]
 *     summary: 批量创建日志
 *     description: 支持批量创建多条日志记录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - level
 *                 - message
 *                 - meta
 *               properties:
 *                 level:
 *                   type: string
 *                   enum: [error, warn, info, http, verbose, debug, silly]
 *                   description: 日志级别
 *                 message:
 *                   type: string
 *                   description: 日志消息
 *                 meta:
 *                   type: object
 *                   required:
 *                     - source
 *                     - environment
 *                   properties:
 *                     operation:
 *                       type: string
 *                       description: 操作类型
 *                     source:
 *                       type: string
 *                       enum: [frontend, backend]
 *                       description: 来源
 *                     environment:
 *                       type: string
 *                       enum: [development, production]
 *                       description: 环境
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                     details:
 *                       type: object
 *                       description: 详细错误信息
 *
 * /api/v1/logs/{id}:
 *   get:
 *     tags: [Log]
 *     summary: 获取日志详情
 *     description: 根据ID获取单条日志的详细信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 日志ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Log'
 *       400:
 *         description: 无效的ID格式
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                       example: "无效的ID格式"
 *       404:
 *         description: 日志不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                       example: "资源不存在"
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                     stack:
 *                       type: string
 *                       description: 错误堆栈(仅开发环境)
 */

module.exports = {};
