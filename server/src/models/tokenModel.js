const mongoose = require("mongoose");
const config = require("../config");

const tokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["refresh"],
            default: "refresh",
        },
        expires: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        userAgent: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// 创建复合索引
tokenSchema.index({ userId: 1, token: 1 });
tokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// 检查令牌是否有效
tokenSchema.methods.isValid = function () {
    return !this.isRevoked && this.expires > new Date();
};

// 撤销令牌
tokenSchema.methods.revoke = async function () {
    this.isRevoked = true;
    return this.save();
};

const Token = mongoose.model(config.db.collections.TOKENS, tokenSchema);

module.exports = Token;
