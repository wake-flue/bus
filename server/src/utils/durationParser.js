/**
 * 将持续时间字符串转换为毫秒数
 * @param {string} durationStr - 持续时间字符串 (例如: "1d", "2h", "30m")
 * @returns {number} 毫秒数
 */
function parseDuration(durationStr) {
    const units = {
        s: 1000, // 秒
        m: 60 * 1000, // 分钟
        h: 60 * 60 * 1000, // 小时
        d: 24 * 60 * 60 * 1000, // 天
    };

    const match = durationStr.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${durationStr}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
}

module.exports = {
    parseDuration,
};
