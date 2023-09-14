// import third-party modules
const { validationResult } = require("express-validator");
const moment = require("moment");
const createCookie = require("../helpers/createCookie");
// import the user modules
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const User = require("../models/User");
const filterData = require("../helpers/filterData");
const validationError = require("../helpers/validationError");
const checkOperation = require("../helpers/checkOperation");
const ProductModel = require("../models/Product");
const sendOrderToCustomerEmail = require("../helpers/sendOrderToCustomerEmail");
const sendOrderToAdminEmail = require("../helpers/sendOrderToAdminEmail");
const prodcutStatistics = require("../helpers/prodcutStatistics");
const fetchOrderData = require("../helpers/fetchOrderData");
const tryCatch = require("../helpers/tryCatch");
require("dotenv").config({
  path: "./config/.env",
});

// create order with wallet
const createOrder = async (req, res, user) => {
  let orderData = fetchOrderData(req);
  const typeOfOperation = req.body["type-of-operation"];

  const order = await Order.create(orderData);
  const tranObj = {
    userId: user._id,
    orderId: order._id,
    totalPrice: order.totalPrice,
    createdAt: Date.now(),
  };
  if (typeOfOperation === "wallet-top-up") {
    const transaction = await Transaction.create({
      transactionType: "deposit",
      ...tranObj,
    });
    order.transactionId = transaction._id;
  } else if (req.body.paymentMethod === "رصيد المحفظة") {
    const transaction = await Transaction.create({
      transactionType: "withdraw",
      ...tranObj,
    });
    // update the user balance and save
    user.balance = user.balance - order.totalPrice;
    user.save();
    order.transactionId = transaction._id;
    const orderCard = order.products.map(
      (product) => product.category === "gameCards"
    );

    if (!orderCard.includes(false)) {
      order.status = "مكتمل";
      transaction.status = "مكتمل";
      await prodcutStatistics(order._id);
    }
  }

  req.app.locals.imageUploaded = undefined;
  res.locals.orderSuccssfully = true;
  if (typeOfOperation == "cart-purchase") {
    res.clearCookie("cart");
  }

  order.save();
  try {
    await sendOrderToCustomerEmail(user, order._id);
    await sendOrderToAdminEmail(user, order._id);
    return res.redirect(`/user/orders/${order._id}/details?new=true`);
  } catch {
    return res.redirect(`/user/orders/${order._id}/details?new=true`);
  }
};

// create order when the user use wallet balance to purchas directly products
const handleOrderWithWallet = async (req, res, user) => {
  // fetch order information from request body
  let orderData = fetchOrderData(req);

  // check that the wallet balance is greater than the total price
  if (user.balance >= orderData.totalPrice) {
    return await createOrder(req, res, user);
  } else {
    ResNoSuccess(req, res);
  }
};

// returns an error message to the user when the wallet balance is not enough
const ResNoSuccess = (req, res) => {
  return res.render("checkout", {
    title: "اتمام الطلب",
    values: req.body,
    product: [req.body],
    typeOfOperation: req.body["type-of-operation"],
    errors: {
      paymentMethod: "ليس لديك رصيد كافي في المحفظة",
    },
  });
};

module.exports = {
  // user profile page
  user_profile: async (req, res) => {
    res.status(200).render("profile", {
      title: "لوحة حسابي",
      layout: "user",
    });
  },
  // render the wallet page with each transactions and wallet  balance
  user_wallet: tryCatch(async (req, res) => {
    // find all  transaction sorted by created At
    const transactions = await Transaction.find({
      userId: req.user._id,
    })
      .populate("orderId", "orderId")
      .sort({
        createdAt: -1,
      })
      .exec();

    const errors = JSON.parse(req.query.errors || "{}");

    res.render("wallet", {
      title: "محفظتي",
      transactions,
      today: Date.now(),
      success: req.query?.new,
      errors,
    });
  }),

  // render the orders page thiw each orders
  user_orders: tryCatch(async (req, res) => {
    // find all  orders sorted by created At
    const orders = await Order.find({
      userId: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(12)
      .exec();

    if (!orders) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    res.render("orders", {
      title: "طلباتي",
      orders,
      today: Date.now(),
    });
  }),

  // user checkout process
  user_checkout: tryCatch(async (req, res) => {
    const typeOfOperation = req.body["type-of-operation"];
    const product = checkOperation(req);
    // returns an error message to the user when the  validation of entered data fails

    const error = validationResult(req);

    if (!error.isEmpty()) {
      const errors = validationError(error);
      if (typeOfOperation == "direct-purchase") {
        return res.redirect(
          `/products/${req.body.productId}?errors=${JSON.stringify(errors)}`
        );
      }
      if (typeOfOperation == "cart-purchase") {
        return res.redirect(`/cart?errors=${JSON.stringify(errors)}`);
      }
      if (typeOfOperation == "wallet-top-up") {
        return res.redirect(`/user/wallet?errors=${JSON.stringify(errors)}`);
      }
    }

    return res.render("checkout", {
      title: "اتمام الطلب",
      product,
      values: req.user,
      typeOfOperation,
    });
  }),

  // confirmation order request
  confirmation: tryCatch(async (req, res) => {
    // validation user input fields
    req.body.imageUploaded = req.app.locals.imageUploaded;
    const error = validationResult(req);
    const errors = validationError(error);
    const typeOfOperation = req.body["type-of-operation"];
    // returns an error message to the user when the  validation of entered data fails

    if (!error.isEmpty()) {
      return res.render("checkout", {
        title: "اتمام الطلب",
        values: req.body,
        product: fetchOrderData(req).products,
        typeOfOperation,
        errors,
      });
    }

    // find the user is already exists
    const user = await User.findById(req.body.userId);

    if (!user) {
      throw new Error("لم يتم العثور عي هذا المستخدم");
    }
    // check the payment Method is wallet methods
    if (req.body.paymentMethod === "رصيد المحفظة") {
      return await handleOrderWithWallet(req, res, user);
    } else {
      // // check the payment Method is bankak methods
      return await createOrder(req, res, user);
    }
  }),

  // send payments method to user
  getBankakInfo: (req, res) => {
    // bankak information
    const paymentData = [
      {
        accountNo: 3115749,
        name: "زهير احمد حامد محمد",
        cardNo: 123456789102030,
        branch: "كافوري 11",
      },{
        accountNo: 3115749,
        name: "زهير احمد حامد محمد",
        cardNo: 123456789102030,
        branch: "كافوري 11",
      },
    ];

    return res.json(paymentData);
  },

  // filter orders by time created
  filterOrders: tryCatch(async (req, res) => {
    const date = moment(req.body.dateFilter).startOf("day");
    const orders = await filterData(req, Order); // render the orders page with orders  filtered
    res.render("orders", {
      title: "طلباتي",
      orders,
      today: date || Date.now(),
    });
  }),

  // filter Transactions: by time created
  filterTransactions: tryCatch(async (req, res) => {
    const date = moment(req.body.dateFilter).startOf("day");
    const transactions = await filterData(req, Transaction);

    // render the wallet page with transactions filtered
    res.render("wallet", {
      title: "محفظتي",
      transactions,
      today: date,
    });
  }),

  // order details
  orderDetails: tryCatch(async (req, res) => {
    // get order id from the parameter
    const { orderId } = req.params;

    // get order by id
    const order = await Order.findById(orderId).populate(
      "userId",
      "fullname email phone"
    );

    // throw error when order not fiund
    if (!order) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }

    // render order details to the user
    res.render("order-details", {
      title: "تفاصيل الطلب",
      order,
      success: req.query?.new ? "شكرا لك, تم استلام طلبك" : req.query.message,
    });
  }),
  repeatOrder: tryCatch(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("لا يمكن تكرار هذه الطلب");
    }
    let shoppingCart = req.cookies["cart"] || [];

    const productsId = order.products.map((pro) => pro.productId);

    if (order.products[0].name === "شحن المحفظة") {
      return res.redirect(
        `/user/orders/${order._id}/details?message=لا يمكن تكرار طلب شحن المحفظة`
      );
    }
    const products = await ProductModel.find({
      _id: { $in: productsId },
      deleted: false,
    });

    products.forEach((product, i) => {
      const cart = {
        productId: product._id,
        image: product.image,
        category: product.category,
        name: product.name,
        amount: order.products[i].amount,
        amountId: order.products[i].amountId,
        count: order.products[i].count,
        price: order.products[i].price,
        totalPrice: order.products[i].totalPrice,
        topUpId: order.products[i].topUpId,
        topUpEmail: order.products[i].topUpEmail,
        topUpPassword: order.products[i].topUpPassword,
        topUpPhone: order.products[i].topUpPhone,
        topUpType: order.products[i].topUpType,
      };

      shoppingCart = shoppingCart.filter(
        (pro) => pro.productId !== order.products[i].productId
      );
      shoppingCart.push(cart);
    });
    createCookie(res, "cart", shoppingCart, 7);
    res.redirect("/cart?success=true");
  }),
};
