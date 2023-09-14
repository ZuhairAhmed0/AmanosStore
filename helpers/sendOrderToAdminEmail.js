const createTransporter = require("./createTransporter");
const OrderModel = require("../models/Order");

// send order to customer email
const sendOrderToAdminEmail = async (user, orderId) => {
    const order = await OrderModel.findById(orderId).populate(
      "userId",
      "fullname"
    );
    const mailOptions = {
        from: user.email,
        to: process.env.EMAIL,
        subject: `لديك طلب جديد مقدم من ${order.userId.fullname}`,
        template: "orderToAdmin",
        context: {
            order: order,
        },
    };

    const emailTransporter = await createTransporter();
    emailTransporter.sendMail(mailOptions);
};

module.exports = sendOrderToAdminEmail;
