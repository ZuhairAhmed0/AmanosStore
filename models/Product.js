const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["متوفر", "غير متوفر"],
    default: "متوفر",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  quantities: [
    {
      amount: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        // required: true,
      },
      available: {
        type: Number,
        default: 0,
      },
      sales: {
        type: Number,
        default: 0,
      },
      revenues: {
        type: Number,
        default: 0,
      },
      profit: {
        type: Number,
        default: 0,
      },
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

// ProductSchema.pre("save", function (next) {
//   const product = this;

//   product.quantities.forEach(function (quantity) {
//     quantity.available = quantity.availableCard.filter(
//       (card) => card.status
//     ).length;
//   });
//   next();
// });
const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
