const mongoose = require("mongoose");
const config = require("../config");
const COLLECTIONS = config.db.collections;

// 公交站点信息
const busStopSchema = new mongoose.Schema({
    stopId: {
        type: String,
        required: true,
        index: true,
    },
    stopName: {
        type: String,
        required: true,
    },
    stopNo: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    crowd: {
        type: Number,
        min: 1,
        max: 4,
    },
});

// 公交车实时位置信息
const busPositionSchema = new mongoose.Schema({
    busId: {
        type: String,
        required: true,
        index: true,
    },
    busNo: {
        type: String,
        required: true,
    },
    busOrder: {
        type: String,
        required: true,
    },
    busType: {
        type: String,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    gpsSpeed: {
        type: String,
    },
    arrived: {
        type: String,
        default: "0",
    },
    lineType: {
        type: String,
        default: "UNKNOWN",
    },
    subLine: {
        type: Boolean,
        default: false,
    },
});

// 发车计划信息
const busPlanSchema = new mongoose.Schema({
    busId: {
        type: String,
        required: true,
        index: true,
    },
    planNo: {
        type: Number,
        required: true,
    },
    planStartTime: {
        type: String,
        required: true,
    },
    planEndTime: {
        type: String,
        required: true,
    },
});

// 线路基本信息
const lineDetailSchema = new mongoose.Schema({
    lineId: {
        type: String,
        required: true,
        index: true,
    },
    lineName: {
        type: String,
        required: true,
    },
    direction: {
        type: String,
        required: true,
    },
    startStop: {
        type: String,
        required: true,
    },
    endStop: {
        type: String,
        required: true,
    },
    earlyHour: {
        type: String,
        required: true,
    },
    lastHour: {
        type: String,
        required: true,
    },
    linePlanShow: {
        type: Number,
        default: 1,
    },
    price: {
        type: String,
    },
});

// 站点到站时间信息
const stopArrivalSchema = new mongoose.Schema({
    sname: {
        type: String,
        required: true,
    },
    siteid: {
        type: String,
        required: true,
        index: true,
    },
    lineid: {
        type: String,
        required: true,
        index: true,
    },
    remaintime: {
        type: String,
    },
});

// 完整的公交线路信息
const busLineSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        lineDetail: {
            type: lineDetailSchema,
            required: true,
        },
        busPositions: [busPositionSchema],
        stops: [busStopSchema],
        plans: [busPlanSchema],
        arrivals: [stopArrivalSchema],
    },
    {
        minimize: false,
    },
);

// 优化复合索引
busLineSchema.index({ "lineDetail.lineId": 1, timestamp: -1 });
busLineSchema.index({ "stops.stopId": 1 });
busLineSchema.index({ "busPositions.busId": 1 });
busLineSchema.index({ "arrivals.siteid": 1, "arrivals.lineid": 1 });

const BusModel = mongoose.model(COLLECTIONS.BUS, busLineSchema);

module.exports = BusModel; 