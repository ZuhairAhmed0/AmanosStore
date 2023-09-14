const { promisify } = require("util");
const moment = require("moment");
const OrderModel = require("../../models/Order");
const UserModel = require("../../models/User");
const TransactionModel = require("../../models/Transaction");
const filterData = require("../../helpers/filterData");
const prodcutStatistics = require("../../helpers/prodcutStatistics");
const sendOrderToCustomerEmail = require("../../helpers/sendOrderToCustomerEmail");
const tryCatch = require("../../helpers/tryCatch");

class Orders {
  constructor() {}

  getAll = tryCatch(async (req, res) => {
    const orders = await OrderModel.find({})
      .populate("userId", "fullname email")
      .limit(24)
      .sort({
        createdAt: -1,
      });
    res.render("dashboard/orders", {
      title: "ادارة الطلبات",
      layout: "dashboard",
      orders,
      today: Date.now(),
      message: req.query.message,
    });
  });

  filter = tryCatch(async (req, res) => {
    const date = moment(req.body.dateFilter).startOf("day");

    const orders = await filterData(req, OrderModel);
    // render the orders page with orders  filtered
    res.render("dashboard/orders", {
      title: "ادارة الطلبات",
      layout: "dashboard",
      orders,
      today: date,
    });
  });
  details = tryCatch(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.find({
      _id: orderId,
    })
      .populate("userId", "fullname email phone")
      .exec();
    res.render("dashboard/orderDetails", {
      title: "ادارة الطلبات",
      layout: "dashboard",
      order,
    });
  });
  complated = tryCatch(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        $set: {
          status: "مكتمل",
        },
      }
    );
    if (!order) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }

    if (order.paymentMethod === "رصيد المحفظة" || order.products[0].name === "شحن المحفظة") {
      await TransactionModel.findOneAndUpdate(
        {
          _id: order.transactionId,
        },
        {
          $set: {
            status: "مكتمل",
          },
        }
      );
    }
    if (order.products[0].name === "شحن المحفظة") {
      const user = await UserModel.findOneAndUpdate(
        {
          _id: order.userId,
        },
        {
          $inc: {
            balance: order.totalPrice,
          },
        }
      );
      if (!user) {
        throw new Error("المستخدم غير موجود");
      }
    } else if (order.products.length !== 0) {
      prodcutStatistics(orderId);
    }

    try {
      await sendOrderToCustomerEmail(req.user, orderId);
      return res.redirect(`/dashboard/orders/${orderId}/details`);
    } catch (err) {
      return res.redirect(`/dashboard/orders/${orderId}/details`);
    }
  });

  // Usage of promisify to convert forEach into promise-based function
  // const asyncForEach = promisify(Array.prototype.forEach);
  cancelled = tryCatch(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.updateOne(
      {
        _id: orderId,
      },
      {
        status: "ملغي",
      }
    );
    const transaction = await TransactionModel.updateOne(
      {
        _id: order.transactionId,
      },
      {
        status: "ملغي",
      }
    );
    if (!order || !transaction) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    try {
      await sendOrderToCustomerEmail(req.user, orderId);
      return res.redirect(`/dashboard/orders/${orderId}/details`);
    } catch (err) {
      return res.redirect(`/dashboard/orders/${orderId}/details`);
    }
  });
  search = tryCatch(async (req, res) => {
    const query = req.query.searchText;
    const NumQuery = !isNaN(parseInt(query)) ? parseInt(query) : -1;
    const searchText = new RegExp(".*" + query + ".*", "i");
    const orders = await OrderModel.find({
      $or: [
        {
          orderId: NumQuery,
        },
        {
          productId: NumQuery,
        },
        {
          price: NumQuery,
        },
        {
          transactionNo: NumQuery,
        },
        {
          name: {
            $regex: searchText,
          },
        },
        {
          amountId: {
            $regex: searchText,
          },
        },
        {
          topUpEmail: {
            $regex: searchText,
          },
        },
        {
          topUpPhone: {
            $regex: searchText,
          },
        },
        {
          topUpType: {
            $regex: searchText,
          },
        },
        {
          paymentMethod: {
            $regex: searchText,
          },
        },
      ],
    });

    res.render("dashboard/orders", {
      title: "ادارة المنتجات",
      layout: "dashboard",
      orders: orders,
      notFound: orders.length
        ? `(${orders.length}) نتائج بحث مطابقة`
        : ` لا توجد نتائج بحث مطابقة (${query})`,
      today: new Date(),
    });
  });
  delete = tryCatch(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.findByIdAndDelete(orderId);

    if (!order) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    return res.redirect("/dashboard/orders?message=تم حذف الطلب بنجاح");
  });
}

module.exports = Orders;
