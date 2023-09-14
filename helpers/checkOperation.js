const checkOperation = (req) => {
  let product = [];
  const typeOfOperation = req.body["type-of-operation"];
  const { price, count } = req.body;
 if (typeOfOperation === "cart-purchase") {
    product = req.cookies["cart"];
  } else {
    product = [{
          ...req.body,
          // price: count * price,
          totalPrice: count * price
        }]
  }
  return product;
};

module.exports = checkOperation;
