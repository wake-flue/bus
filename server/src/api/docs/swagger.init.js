/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: 用户认证
 *   - name: User
 *     description: 用户管理
 *   - name: Todo
 *     description: 待办事项管理
 *   - name: Log
 *     description: 系统日志
 *
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           description: 状态码
 *         data:
 *           type: object
 *           description: 响应数据
 *         message:
 *           type: string
 *           description: 响应信息
 *
 *     PageInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *         total:
 *           type: integer
 *           description: 总数量
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: integer
 *               description: HTTP状态码
 *             operation:
 *               type: string
 *               description: 操作类型
 *               enum: [BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, DATABASE_ERROR, NETWORK_ERROR, UNKNOWN_ERROR]
 *             message:
 *               type: string
 *               description: 错误信息
 *             details:
 *               type: string
 *               description: 详细错误信息
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: integer
 *               example: 400
 *             operation:
 *               type: string
 *               example: VALIDATION_ERROR
 *             message:
 *               type: string
 *               description: 验证错误信息
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: 字段名
 *                   message:
 *                     type: string
 *                     description: 具体错误信息
 *                   value:
 *                     type: string
 *                     description: 错误的值
 *
 *     ErrorCodes:
 *       type: object
 *       description: 系统错误码说明
 *       properties:
 *         200:
 *           type: string
 *           description: 请求成功
 *         201:
 *           type: string
 *           description: 创建成功
 *         400:
 *           type: string
 *           description: 请求参数错误或验证失败
 *         401:
 *           type: string
 *           description: 未授权,请先登录
 *         403:
 *           type: string
 *           description: 禁止访问,权限不足
 *         404:
 *           type: string
 *           description: 请求的资源不存在
 *         500:
 *           type: string
 *           description: 服务器内部错误
 *
 *     ValidationRules:
 *       type: object
 *       description: 通用字段验证规则说明
 *       properties:
 *         string:
 *           type: object
 *           properties:
 *             minLength:
 *               type: integer
 *               description: 最小长度限制
 *             maxLength:
 *               type: integer
 *               description: 最大长度限制
 *             pattern:
 *               type: string
 *               description: 正则表达式匹配规则
 *         number:
 *           type: object
 *           properties:
 *             minimum:
 *               type: number
 *               description: 最小值限制
 *             maximum:
 *               type: number
 *               description: 最大值限制
 *         array:
 *           type: object
 *           properties:
 *             minItems:
 *               type: integer
 *               description: 最小元素数量
 *             maxItems:
 *               type: integer
 *               description: 最大元素数量
 *         date:
 *           type: object
 *           properties:
 *             format:
 *               type: string
 *               description: 日期格式要求
 *             minimum:
 *               type: string
 *               description: 最小日期限制
 *             maximum:
 *               type: string
 *               description: 最大日期限制
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT令牌
 *
 *   parameters:
 *     pageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *         minimum: 1
 *       description: 页码
 *
 *     pageSizeParam:
 *       in: query
 *       name: pageSize
 *       schema:
 *         type: integer
 *         default: 20
 *         minimum: 1
 *         maximum: 100
 *       description: 每页数量
 */

module.exports = {};
