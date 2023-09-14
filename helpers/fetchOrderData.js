// get order from req body
const fetchOrderData = (req) => {
  const _ = req.body;
  count = [...[].concat(_.count)];
  price = [...[].concat(_.price)];
  const order = {
    userId: _.userId,
    phone: _.phone,
    totalPrice: +_.totalPrice,
    transactionNo: _.transactionNo,
    bankakAccountNo: _.bankakAccountNo,
    transactionAmount: _.transactionAmount,
    paymentMethod: _.paymentMethod,
    createdAt: Date.now(),
    products: [...[].concat(_.name)].map((name, i) => {
      return {
        name,
        amount: [...[].concat(_.amount)][i],
        amountId: [...[].concat(_.amountId)][i],
        count: count[i],
        price: price[i],
        category: [...[].concat(_.category)][i],
        totalPrice: +price[i] * +count[i],
        topUpId: [...[].concat(_.topUpId)][i],
        topUpEmail: [...[].concat(_.topUpEmail)][i],
        topUpPassword: [...[].concat(_.topUpPassword)][i],
        topUpType: [...[].concat(_.topUpType)][i],
        topUpPhone: [...[].concat(_.topUpPhone)][i],
        productId: [...[].concat(_.productId)][i],
      };
    }),
  };
  return order;
};

module.exports = fetchOrderData;
