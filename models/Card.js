const mongoose = require("mongoose");

const CardSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  amountId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    default: "متوفر",
  },
  createdAt: Date,
  updatedAt: Date,
});

// CardSchema.pre(/find/, async function (next) {
//   await this.populate("product");
//   next();
// });

const Card = mongoose.model("card", CardSchema);

module.exports = Card;
