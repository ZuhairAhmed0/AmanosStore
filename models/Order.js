const mongoose = require("mongoose");
const commonFields = require("./commonFields");

const OrderSchema = new mongoose.Schema({
  ...commonFields.obj,
  orderId: {
    type: Number,
    unique: true,
    index: true,
  },
  phone: Number,
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  paymentMethod: String,
  transactionNo: Number,
  bankakAccountNo: Number,
  transactionAmount: Number,
  products: [
    {
      productId: String,
      name: {
        type: String,
        required: true,
      },
      amount: String,
      amountId: String,
      count: {
        type: Number,
        required: true,
      },
      cardNo: [String],
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      category: String,
      topUpId: String,
      topUpEmail: String,
      topUpPassword: String,
      topUpPhone: String,
      topUpType: String,
    },
  ],
});

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    let orderId = Math.floor(1000000 + Math.random() * 9000000);
    while (
      await Order.exists({
        orderId,
      })
    ) {
      orderId = Math.floor(1000000 + Math.random() * 9000000);
    }

    this.orderId = orderId;
    return next();
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
