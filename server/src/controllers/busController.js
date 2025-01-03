const busService = require('../services/busService');
const ResponseHandler = require('../utils/responseHandler');
const BaseController = require('./baseController');
const catchAsync = require('../utils/catchAsync');

class BusController extends BaseController {
    constructor() {
        super(busService);
    }

    // 获取实时公交信息
    getBusRealTimeInfo = catchAsync(async (req, res) => {
        const { lineCode } = req.params;
        
        // 并行获取所有需要的数据
        const [preTimeData, lineData] = await Promise.all([
            this.service.getPreTime(lineCode),
            this.service.getLineDetail(lineCode)
        ]);

        // 获取发车计划
        const planTimeData = await this.service.getPlanTime(lineData.lineDetailBaseDto.lineId);

        // 整合数据
        const busInfo = {
            lineDetail: lineData.lineDetailBaseDto,
            busPositions: lineData.lineBusDtoList,
            stops: lineData.stopDetailList,
            plans: planTimeData,
            arrivals: Object.values(preTimeData)
        };

        return ResponseHandler.success(res, { busInfo });
    });

    // 获取站点到站时间
    getStationArrivalTime = catchAsync(async (req, res) => {
        const { lineCode } = req.params;
        const preTimeData = await this.service.getPreTime(lineCode);
        return ResponseHandler.success(res, { arrivals: Object.values(preTimeData) });
    });

    // 获取发车计划
    getBusPlanTime = catchAsync(async (req, res) => {
        const { lineId } = req.params;
        const planTimeData = await this.service.getPlanTime(lineId);
        return ResponseHandler.success(res, { plans: planTimeData });
    });
}

module.exports = new BusController(); 