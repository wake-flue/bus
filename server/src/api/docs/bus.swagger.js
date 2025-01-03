/**
 * @swagger
 * components:
 *   schemas:
 *     LineDetail:
 *       type: object
 *       properties:
 *         lineId:
 *           type: string
 *           description: 线路ID
 *         lineName:
 *           type: string
 *           description: 线路名称
 *         startStationName:
 *           type: string
 *           description: 起点站名
 *         endStationName:
 *           type: string
 *           description: 终点站名
 *         firstTime:
 *           type: string
 *           description: 首班车时间
 *         lastTime:
 *           type: string
 *           description: 末班车时间
 *         price:
 *           type: number
 *           description: 票价
 *
 *     BusPosition:
 *       type: object
 *       properties:
 *         busId:
 *           type: string
 *           description: 车辆ID
 *         plateNumber:
 *           type: string
 *           description: 车牌号
 *         latitude:
 *           type: number
 *           description: 纬度
 *         longitude:
 *           type: number
 *           description: 经度
 *         speed:
 *           type: number
 *           description: 速度
 *         direction:
 *           type: number
 *           description: 方向
 *
 *     BusStop:
 *       type: object
 *       properties:
 *         stopId:
 *           type: string
 *           description: 站点ID
 *         stopName:
 *           type: string
 *           description: 站点名称
 *         latitude:
 *           type: number
 *           description: 纬度
 *         longitude:
 *           type: number
 *           description: 经度
 *         sequence:
 *           type: number
 *           description: 站点顺序
 *
 *     BusArrival:
 *       type: object
 *       properties:
 *         stopId:
 *           type: string
 *           description: 站点ID
 *         stopName:
 *           type: string
 *           description: 站点名称
 *         arrivalTime:
 *           type: number
 *           description: 预计到站时间(秒)
 *         distance:
 *           type: number
 *           description: 距离(米)
 *
 *     BusPlan:
 *       type: object
 *       properties:
 *         planId:
 *           type: string
 *           description: 计划ID
 *         departureTime:
 *           type: string
 *           description: 发车时间
 *         busId:
 *           type: string
 *           description: 车辆ID
 *         status:
 *           type: string
 *           enum: [waiting, departed, completed]
 *           description: 计划状态
 *
 *     BusInfo:
 *       type: object
 *       properties:
 *         lineDetail:
 *           $ref: '#/components/schemas/LineDetail'
 *         busPositions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BusPosition'
 *         stops:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BusStop'
 *         plans:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BusPlan'
 *         arrivals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BusArrival'
 *
 * @swagger
 * tags:
 *   name: Bus
 *   description: 公交信息相关接口
 */

/**
 * @swagger
 * /api/v1/bus/realtime/{lineCode}:
 *   get:
 *     summary: 获取实时公交信息
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: lineCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 线路编号
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 busInfo:
 *                   $ref: '#/components/schemas/BusInfo'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/bus/arrival/{lineCode}:
 *   get:
 *     summary: 获取站点到站时间
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: lineCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 线路编号
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 arrivals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BusArrival'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/bus/plan/{lineId}:
 *   get:
 *     summary: 获取发车计划
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: lineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 线路ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BusPlan'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */ 