const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const CardModel = require("../models/Card");

async function prodcutStatistics(orderId) {
  const order = await OrderModel.findById(orderId);
  for (const [i, product] of order.products.entries()) {
    const productAll = await ProductModel.findById(product.productId);
    const amountIds = productAll.quantities.map((q) => q.id);
    const quantity = productAll.quantities.find((q) => q.id == amountIds[i]);

    const cards = await CardModel.find({
      amountId: quantity._id,
      status: "متوفر",
    }).limit(product.count);
    if (cards.length) {
      quantity.available -= product.count;
      quantity.sales += product.count;
      quantity.revenues += quantity.price * product.count;
      quantity.profit += (quantity.price - quantity.totalPrice) * product.count;
      cards.forEach((card) => {
        product.cardNo.push(card.code);
        card.status = "مباع";
        card.updatedAt = new Date();
        card.save();
      });
    }

    const availableQuantities = productAll.quantities
      .map((a) => a.available)
      .reduce((a, b) => a + b);

    if (availableQuantities == 0) {
      productAll.status = "غير متوفر";
    }
    await productAll.save();
  }
  await order.save();
}

module.exports = prodcutStatistics;
