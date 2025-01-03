const BaseService = require('./baseService');
const busApiClient = require('../utils/apiClient');

class BusService extends BaseService {
    constructor() {
        super(null); // bus服务不需要数据模型
    }

    // 获取站点到站时间信息
    async getPreTime(lineCode) {
        return busApiClient.getPreTime(lineCode);
    }

    // 获取发车计划信息
    async getPlanTime(lineId) {
        return busApiClient.getPlanTime(lineId);
    }

    // 获取线路详细信息
    async getLineDetail(lineCode) {
        return busApiClient.getLineDetail(lineCode);
    }
}

module.exports = new BusService(); 