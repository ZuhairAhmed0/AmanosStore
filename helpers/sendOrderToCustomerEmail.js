const createTransporter = require("../helpers/createTransporter");
const OrderModel = require("../models/Order");

// send order to customer email
const sendOrderToCustomerEmail = async (user, orderId) => {
  const order = await OrderModel.findById(orderId);
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: `الطلب ${order.status}`,
    template: "order-info",
    context: {
      order: order,
    },
  };

  const emailTransporter = await createTransporter();
  emailTransporter.sendMail(mailOptions);
};

module.exports = sendOrderToCustomerEmail;
