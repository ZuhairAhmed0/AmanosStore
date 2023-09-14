const moment = require("moment");
const UserModel = require("../../models/User");
const OrderModel = require("../../models/Order");
const CardModel = require("../../models/Card");
const ProductModel = require("../../models/Product");
const tryCatch = require("../../helpers/tryCatch");
const orderReport = require("../../helpers/orderReport");

class Users {
  constructor() {}

  dashboard = tryCatch(async (req, res) => {
    const query = {
      createdAt: {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      },
      productId: {
        $ne: "",
      },
    };
    const productsDetails = await ProductModel.find();
    const orderOfDay = await OrderModel.find(query);
    const reportOfDay = orderReport(orderOfDay, productsDetails);

    res.render("dashboard/home", {
      title: "لوحة التحكم",
      layout: "dashboard",
      ordersCount: await OrderModel.countDocuments(),
      usersCount: await UserModel.countDocuments(),
      productsCount: await ProductModel.countDocuments(),
      productsDetails,
      coustomer: await OrderModel.distinct("userId").then(
        (orders) => orders.length
      ),
      incompalteOrders: await OrderModel.countDocuments({
        status: "قيد المعالجة",
      }),
      orderOfDay: orderOfDay.length,
      salesOfDay: reportOfDay.sales,
      revenuesOfDay: reportOfDay.revenues,
      profitsOfDay: reportOfDay.profits,
    });
  });

  getAll = tryCatch(async (req, res) => {
    const users = await UserModel.find({});

    users.forEach(async (user, i) => {
      users[i].ordersCount = await OrderModel.countDocuments({
        userId: user._id,
      });
    });
    res.render("dashboard/users", {
      title: "ادارة المستخدمين",
      layout: "dashboard",
      users: users,
      message: req.query.message,
    });
  });

  getOrders = tryCatch(async (req, res) => {
    const orders = await OrderModel.find({ userId: req.params.id });
    res.render("dashboard/orders", {
      title: "ادارة الطلبات",
      layout: "dashboard",
      orders: orders,
    });
  });
  search = tryCatch(async (req, res) => {
    const query = req.query.searchText;
    const NumQuery = !isNaN(parseInt(query)) ? parseInt(query) : -1;
    const searchText = new RegExp(".*" + query + ".*", "i");
    const users = await UserModel.find({
      $or: [
        { fullname: { $regex: searchText } },
        { role: { $regex: searchText } },
        { email: query },
        { username: query },
        { accountNumber: NumQuery },
        { phone: NumQuery },
      ],
    });

    if (users.length == 0) {
      throw new Error("user not found");
    }
    // render the orders page with orders  filtered
    res.render("dashboard/users", {
      title: "ادارة المنتجات",
      layout: "dashboard",
      users: users,
      notFound: users.length
        ? `(${users.length}) نتائج بحث مطابقة`
        : `لا توجد نتائج بحث مطابقة (${query})`,
      today: new Date(),
    });
  });
  updateRolePage = tryCatch(async (req, res) => {
    const userId = req.params.id;
    let message = "";
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("لم يتم العثور علي المستخدم المحدد");
    }
    res.render("dashboard/userDetails", {
      title: "تفاصيل المستخدم",
      layout: "dashboard",
      user,
      message,
    });
  });

  updateRole = tryCatch(async (req, res) => {
    const userId = req.params.id;
    let message = "";
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("لم يتم العثور علي المستخدم المحدد");
    }

    if (user.role !== "admin") {
      user.role = req.body.role;
      user.save();
      message = "تم حفظ التغييرات بنجاح";
    } else {
      message = "لا يمكن تغيير صلاحية الادمن";
    }

    res.render("dashboard/userDetails", {
      title: "تفاصيل المستخدم",
      layout: "dashboard",
      user,
      message,
    });
  });

  delete = tryCatch(async (req, res) => {
    const userId = req.params.id;
    let message = "";
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("لم يتم العثور علي المستخدم المحدد");
    }
    if (req.user.role !== "admin") {
      message = "ليس لديك الصلاحية الكاملة لتنفيذ هذا الخيار";
    }

    if (user.role !== "admin") {
      const user = await UserModel.findByIdAndUpdate(userId, { deleted: true });
      return res.redirect("/dashboard/users?message=تم حذف المستخدم بنجاح");
    } else {
      message = "لا يمكن حذف الادمن";
    }

    res.render("dashboard/userDetails", {
      title: "تفاصيل المستخدم",
      layout: "dashboard",
      user,
      message,
    });
  });
  restore = tryCatch(async (req, res) => {
    const userId = req.params.id;
    let message = "";
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("لم يتم العثور علي المستخدم المحدد");
    }
    if (req.user.role !== "admin") {
      message = "ليس لديك الصلاحية الكاملة لتنفيذ هذا الخيار";
    }

    if (user.role !== "admin") {
      const user = await UserModel.findByIdAndUpdate(userId, {
        deleted: false,
      });
      return res.redirect("/dashboard/users?message=تم استرجاع المستخدم بنجاح");
    } else {
      message = "لا يمكن حذف الادمن";
    }

    res.render("dashboard/userDetails", {
      title: "تفاصيل المستخدم",
      layout: "dashboard",
      user,
      message,
    });
  });
}

module.exports = Users;
