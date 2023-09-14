const mongoose = require("mongoose");
const commonFields = require("./commonFields");

const TransactionSchema = mongoose.Schema({
    ...commonFields.obj,
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    transactionId: {
        type: Number,
        unique: true,
        index: true
    },
    transactionType: {
        type: String,
        enum: ["withdraw", "deposit"]
    }
});

TransactionSchema.pre("save", async function (next) {
    if (this.isNew) {
        let transactionId = Math.floor(1000000 + Math.random() * 9000000)
        while (await Transaction.exists({
            transactionId
        })) {
            transactionId = Math.floor(1000000 + Math.random() * 9000000)
        }

        this.transactionId = transactionId;
        return next()
    }
    next();
});
const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;