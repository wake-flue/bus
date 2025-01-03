const axios = require('axios');
const { BadRequestError } = require('./apiError');

class BusApiClient {
    constructor() {
        this.baseUrl = 'https://urapp.i-xiaoma.com.cn/app/v2/bus/new';
        this.headers = {
            'User-Agent': 'Android',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json; charset=UTF-8'
        };
        this.defaultParams = {
            appKey: process.env.BUS_APP_KEY,
            channelName: "xiaoma",
            deviceId: "a6cafa9caf5510c6",
            deviceType: 1,
            phoneManufacturer: "Xiaomi",
            phoneModel: "2203121C", 
            phoneVersion: "9",
            pushToken: "160a3797c9317d8c916",
            versionCode: "118",
            versionName: "1.1.8",
            xiaomaAppId: process.env.BUS_APP_KEY
        };
    }

    async request(endpoint, text) {
        try {
            const response = await axios.post(
                `${this.baseUrl}${endpoint}`,
                {
                    ...this.defaultParams,
                    timeRequest: Date.now(),
                    [endpoint.includes('planTime') ? 'lineId' : 'lineCode']: text,
                },
                { headers: this.headers }
            );

            if (response.data.success) {
                return response.data.data;
            }
            throw new BadRequestError(response.data.msg.message);
        } catch (error) {
            if(error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError(`请求失败: ${error.message}`);
        }
    }

    async getPreTime(lineCode) {
        return this.request('/preTime/yantai', lineCode);
    }

    async getPlanTime(lineId) {
        return this.request('/planTime', lineId);
    }

    async getLineDetail(lineCode) {
        return this.request('/line', lineCode);
    }
}

module.exports = new BusApiClient(); 