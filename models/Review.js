const mongoose = require("mongoose");
const ReviewScehma = mongoose.Schema({
  rating: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  comment: String,
  commentedAt: {
    type: Date,
    default: Date.now()
  },
});


const Review = mongoose.model("Review", ReviewScehma);

module.exports  = Review;