const Product = require("../models/Product");
const tryCatch = require("../helpers/tryCatch");

const FindByCategory = (category) => {
  return Product.aggregate([
    {
      $match: {
        category: category,
        deleted: false
      },
    },
    {
      $addFields: {
        random: Math.floor(Math.random() * 10),
      },
    },
    { $sample: { size: 10 } },
    { $sort: { random: 1 } },
  ]);
};

const getAllProducts = tryCatch(async (req, res) => {
  const products = {
    gamesTopUp: [
      ...(await FindByCategory("topUpById")),
      ...(await FindByCategory("topUpByAccount")),
    ],
    // balanceTopUp: await FindByCategory("balanceTopUp"),
    gameCards: await FindByCategory("gameCards"),
  };

  const productsAll = await Product.find({deleted: false});
  for (const product of productsAll) {
    for (const quantity of product.quantities) {
      const availableQuantities = product.quantities
        .map((a) => a.available)
        .reduce((a, b) => a + b);

      if (availableQuantities == 0) {
        product.status = "غير متوفر";
      } else {
        product.status = "متوفر";
      }
      await product.save();
    }
  }
  res.render("home", {
    title: "الرئيسية",
    products,
  });
});

const gamesTopUp = tryCatch(async (req, res) => {
  const products = {
    topUpById: await FindByCategory("topUpById"),
    topUpByAccount: await FindByCategory("topUpByAccount"),
  };

  res.render("products", {
    title: "شحن الالعاب",
    products,
    gamesTopUp: true,
  });
});

const gameCards = tryCatch(async (req, res) => {
  const products = await FindByCategory("gameCards");

  res.render("products", {
    title: "بطاقات الالعاب",
    products,
    gameCards: true,
  });
});

const balanceTopUp = tryCatch(async (req, res) => {
  const products = await FindByCategory("balanceTopUp");

  res.render("products", {
    title: "شحن رصيد الاتصالات",
    products,
    balanceTopUp: true,
  });
});

module.exports = {
  getAllProducts,
  gamesTopUp,
  gameCards,
  balanceTopUp,
};
