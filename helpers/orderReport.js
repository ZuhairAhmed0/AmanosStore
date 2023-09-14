const orderReport = (order, productsDetails) => {
  const products = order
    .flatMap((ord) => ord.products)
    .filter((product) => product.name !== "شحن المحفظة");
  const productsPrices = [];
  const productsToatlPrices = [];

  for (const product of products) {
    const totalPrice = productsDetails
      .flatMap((prod) => prod.quantities)
      .find((q) => q.id == product.amountId);
    productsPrices.push(totalPrice.price * product.count);
    productsToatlPrices.push(totalPrice.totalPrice * product.count);
  }
  const sales = products
    .map((product) => product.count)
    .reduce((a, b) => a + b, 0);

  const revenues = productsPrices.reduce((a, b) => a + b, 0);
  const profits = productsToatlPrices.reduce((a, b) => a + b, 0);
 
  return {
    sales,
    revenues,
    profits: revenues - profits,
  };
};

module.exports = orderReport;
