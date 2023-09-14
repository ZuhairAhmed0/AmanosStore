const mongoose = require("mongoose");

module.exports = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        createdAt: {
                type: Date,
            default: Date.now(new Date().toLocaleDateString()),
            },
        status: {
            type: String,
            default: "قيد المعالجة",
            },
        },
        {
            discriminatorKey: "type",
        }
    );