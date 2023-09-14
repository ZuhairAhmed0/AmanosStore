const moment = require("moment");
const OrderModel = require("../../models/Order");
const CardModel = require("../../models/Card");
const ProductModel = require("../../models/Product");
const tryCatch = require("../../helpers/tryCatch");
const orderReport = require("../../helpers/orderReport");

class Reports {
  constructor() {}

  static generateMonthlyReport = async (month) => {

    const getCardsForMonth = async (month) => {
      const reportOfYear = await CardModel.find();
      const cards = reportOfYear.filter(
        (report) => moment(report.updatedAt).format("M") == month
      );
      return cards;
    };
  
    const getOrdersForMonth = async (month) => {
      const order = await OrderModel.find();
      const orders = order.filter(
        (ord) => moment(ord.createdAt).format("M") == month
      );
      return orders;
    };


    const cards = await getCardsForMonth(month);
    const orderOfMonth = await getOrdersForMonth(month);
    const productsDetails = await ProductModel.find();
    const customers = [...new Set(orderOfMonth.map((user) => user.userId.toString()))];
    const reportOfMonth = orderReport(orderOfMonth, productsDetails);



    return {
      month: month,
      cards: cards.length,
      orders: orderOfMonth.length,
      customers: customers.length,
      ...reportOfMonth,
    };
  };
  yearlyReport = tryCatch(async (req, res) => {
    const yaerReport = [];

    for (let i = 1; i <= 12; i++) {
      const monthReport = await Reports.generateMonthlyReport(i);
      yaerReport.push(monthReport);
    }

    res.render("dashboard/reports", {
      title: "تقرير سنوي",
      layout: "dashboard",
      reports: yaerReport,
    });
  });

  monthlyReport = tryCatch(async (req, res) => {
    const monthReport = await Reports.generateMonthlyReport(req.params.month);
    res.render("dashboard/printReport", {
      title: "تقرير شهري - " + req.params.month,
      layout: null,
      reports: monthReport,
    });
  });
}

module.exports = Reports;
