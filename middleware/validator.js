const { body, check } = require("express-validator");
const moment = require("moment");
const User = require("../models/User");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const CardModel = require("../models/Card");

const validate = (method) => {
  switch (method) {
    case "signup": {
      return [
        body("fullname")
          .isString()
          .notEmpty()
          .withMessage("الاسم ثلاثي مطلوب")
          .trim()
          .escape(),
        body("username")
          .isString()
          .notEmpty()
          .withMessage("اسم المستخدم مطلوب")
          .custom((value) => {
            return User.find({
              username: value,
            }).then((user) => {
              if (user.length > 0) {
                return Promise.reject("اسم المستخدم مستخدم بالفعل");
              }
            });
          })
          .trim()
          .escape(),
        body("email")
          .isEmail()
          .withMessage("ادخل بريد الكتروني صالح")
          .notEmpty()
          .withMessage("البريد الالكتروني مطلوب")
          .custom((value) => {
            return User.findOne({
              email: value,
            }).then((user) => {
              if (user) {
                return Promise.reject("البريد الالكتروني مسجل بالفعل");
              }
            });
          })
          .trim()
          .escape()
          .normalizeEmail(),
        body("phone")
          .optional()
          .isMobilePhone()
          .isLength({
            min: 9,
            max: 10,
          })
          .withMessage("من فصلك ادخل رقم هاتف صالح")
          .trim()
          .escape(),
        body("password")
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
          })
          .withMessage(
            "يجب ان تتكون من 6 خانات علي الاقل ارقام وحروف كبيرة وصغيرة"
          )
          .notEmpty()
          .withMessage("كلمة المرور مطلوبة")
          .trim()
          .escape(),
        body("repeat_password")
          .notEmpty()
          .withMessage("يجب تاكيد كلمة المرور")
          .custom((value, { req }) => value === req.body.password)
          .withMessage("كلمة المرور غير مطابقة")
          .trim()
          .escape(),
      ];
    }
    case "login": {
      return [
        body("username")
          .isString()
          .notEmpty()
          .withMessage("اسم المستخدم مطلوب")
          .trim()
          .escape(),
        body("password")
          .trim()
          .notEmpty()
          .withMessage("كلمة المرور مطلوبة")
          .trim()
          .escape(),
      ];
    }
    case "forgetPassword": {
      return [
        body("email")
          .isEmail()
          .withMessage("ادخل بريد الكتروني صالح")
          .custom((value) => {
            return User.findOne({
              email: value,
            }).then((user) => {
              if (!user) {
                return Promise.reject("البريد الالكتروني غير مسجل");
              }
            });
          })
          .notEmpty()
          .withMessage("البريد الالكتروني مطلوب")
          .trim()
          .escape()
          .normalizeEmail(),
      ];
    }
    case "resetPassword": {
      return [
        body("password")
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
          })
          .withMessage(
            "يجب ان تتكون من 6 خانات علي الاقل ارقام وحروف كبيرة وصغيرة"
          )
          .notEmpty()
          .withMessage("كلمة المرور مطلوبة")
          .trim()
          .escape(),
        body("repeat_password")
          .notEmpty()
          .withMessage("يجب تاكيد كلمة المرور")
          .custom((value, { req }) => value === req.body.password)
          .withMessage("كلمة المرور غير مطابقة")
          .trim()
          .escape(),
      ];
    }

    case "update": {
      return [
        body("fullname").isString().notEmpty().withMessage("الاسم ثلاثي مطلوب"),
        body("username")
          .isString()
          .notEmpty()
          .withMessage("اسم المستخدم مطلوب")
          .custom((value, { req }) => {
            return User.findOne({
              username: value,
            }).then((user) => {
              if (user && user.username !== req.user.username) {
                return Promise.reject("اسم المستخدم مستخدم بالفعل");
              }
            });
          })
          .trim()
          .escape(),
        body("email")
          .isEmail()
          .withMessage("ادخل بريد الكتروني صالح")
          .custom((value, { req }) => {
            return User.findOne({
              email: value,
            }).then((user) => {
              if (user && user.email !== req.user.email) {
                return Promise.reject("البريد الالكتروني مستخدم بالفعل");
              }
            });
          })
          .notEmpty()
          .withMessage("البريد الالكتروني مطلوب")
          .trim()
          .escape(),
        body("phone")
          .isMobilePhone()
          .isLength({
            min: 9,
            max: 10,
          })
          .withMessage("من فصلك ادخل رقم هاتف صالح")
          .trim()
          .escape(),
      ];
    }
    case "product": {
      return [
        body("name")
          .isString()
          .notEmpty()
          .withMessage("اسم المنتج مطلوب")
          .trim()
          .escape(),
        body("category")
          .isString()
          .notEmpty()
          .withMessage("تنصيف المنتج مطلوب")
          .trim()
          .escape(),
        body("amounts")
          .isString()
          .trim()
          .notEmpty()
          .withMessage("كميات المنتج مطلوبة")
          .trim()
          .escape(),
        body("prices")
          .isString()
          .custom(
            (val, { req }) =>
              val?.split(",").length === req.body?.amounts.split(",").length
          )
          .withMessage("يجب اضافة اسعار البطاقات المحددة")
          .notEmpty()
          .withMessage("اسعار البطاقات مطلوب")
          .trim()
          .escape(),
        body("totalPrices")
          .isString()
          .custom(
            (val, { req }) =>
              val?.split(",").length === req.body?.prices.split(",").length
          )
          .withMessage("يجب اضافة السعر الاجمالي لكل الكميات المحددة")
          .notEmpty()
          .withMessage("السعر الاجمالي  لكل  كمية مطلوبة")
          .trim()
          .escape(),
        body("title")
          .isString()
          .notEmpty()
          .withMessage("عنوان الكمية مطلوب")
          .trim()
          .escape(),
        check("imageUploaded")
          .trim()
          .custom((value, { req }) => {
            if (!req.app.locals.imageUploaded && !req.body.image) {
              throw new Error("صورة المنتج مطلوبة");
            }
            return true;
          })
          .trim(),
      ];
    }
    case "order": {
      return [
        body("paymentMethod")
          .isString()
          .notEmpty()
          .withMessage("من فضلك حدد وسيلة الدفع")
          .trim()
          .escape(),
        body("transactionNo")
          .custom((value, { req }) => {
            if (req.body.paymentMethod === "بنكك" && !value) {
              throw new Error("رقم العملية مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("transactionAmount")
          .custom((value, { req }) => {
            if (req.body.paymentMethod === "بنكك" && !value) {
              throw new Error("مبلغ المعاملة مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("bankakAccountNo")
          .custom((value, { req }) => {
            if (req.body.paymentMethod === "بنكك" && !value) {
              throw new Error("رقم الحساب المحول له مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("amountId")
          .custom(async (value, { req }) => {
            if (
              req.body["type-of-operation"] !== "wallet-top-up" &&
              req.body.paymentMethod
            ) {
              const productIds = [...[].concat(req.body.productId)];
              const amountIds = [...[].concat(req.body.amountId)];
              const names = [...[].concat(req.body.name)];
              const counts = [...[].concat(req.body.count)];
              for (const [i, id] of productIds.entries()) {
                const product = await ProductModel.findOne({
                  _id: id,
                  deleted: false,
                });

                const quantity = product.quantities.find(
                  (q) => q.id == amountIds[i]
                );
                if (quantity.available < counts[i]) {
                  throw new Error(
                    `الكمية المحددة من (${product.name}) غير متوفرة بالمخزون`
                  );
                }
              }
            }

            return true;
          })
          .trim()
          .escape(),
      ];
    }
    case "gameTopUp": {
      return [
        body("topUpId")
          .custom((value, { req }) => {
            if (req.body.category === "topUpById" && !value) {
              throw new Error("معرف اللاعب مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("topUpEmail")
          .custom((value, { req }) => {
            if (req.body.category === "topUpByAccount" && !value) {
              throw new Error("البريد الالكتروني او الرقم مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("topUpPassword")
          .custom((value, { req }) => {
            if (req.body.category === "topUpByAccount" && !value) {
              throw new Error("كلمة المرور مطلوبة");
            }
            return true;
          })
          .trim()
          .escape(),
        body("topUpType")
          .custom((value, { req }) => {
            if (req.body.category === "topUpByAccount" && !value) {
              throw new Error("هذا الحقل مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("topUpPhone")
          .custom((value, { req }) => {
            if (req.body.category === "topUpByAccount" && !value) {
              throw new Error("رقم الواتساب مطلوب");
            }
            return true;
          })
          .trim()
          .escape(),
        body("price")
          .custom((value, { req }) => {
            if (req.body["type-of-operation"] !== "wallet-top-up" && !value) {
              throw new Error("من فضلك حدد الكمية المطلوبة");
            }
            return true;
          })
          .trim()
          .escape(),
        body("amountId")
          .custom(async (value, { req }) => {
            if (req.body["type-of-operation"] !== "wallet-top-up") {
              if (!value) {
                throw new Error("من فضلك حدد الكمية المطلوبة");
              }
              const amountIds = [...[].concat(req.body.amountId)];
              const productId = [...[].concat(req.body.productId)];
              const counts = [...[].concat(req.body.count)];
              const products = await ProductModel.find({
                _id: {
                  $in: productId,
                },
              });

              products.forEach((product, i) => {
                product.quantities.forEach((quantity) => {
                  amountIds.forEach((aId) => {
                    if (quantity.id == aId && quantity.available < counts[i]) {
                      throw new Error(
                        `الكمية المحددة من (${product.name}) غير متوفرة بالمخزون`
                      );
                    }
                  });
                });
              });
            }

            return true;
          })
          .trim()
          .escape(),
        body("balance")
          .custom((value, { req }) => {
            if (req.body.typeOfOperation == "wallet-top-up") {
              if (!value) {
                throw new Error(
                  "من فضلك ادخل المبلغ الذي تريد اضافته في محفظتك"
                );
              } else if (isNaN(parseInt(value))) {
                throw new Error("من فضلك ادخل مبلغ صالح");
              }
            }
            return true;
          })
          .trim()
          .escape(),
      ];
    }
    case "cardTopUp": {
      return [
        body("cardNumbers")
          .isString()
          .withMessage("من فضلك ادخل بطاقات صالحة")
          .notEmpty()
          .withMessage("ارقام البطاقات مطلوبة")
          .trim(),
      ];
    }
    case "reivew": {
      return [
        body("rating")
          .isString()
          .notEmpty()
          .withMessage("من فضلك قم بالتقييم اولا")
          .trim(),
        body("comment")
          .isString()
          .notEmpty()
          .withMessage("من فضلك قم بكتابة مراجعتك")
          .trim(),
      ];
    }

    case "search": {
      return [
        body("searchText")
          .isString()
          .notEmpty()
          .withMessage("من فضلك قم كتابة ما تريد البحث عنه ")
          .trim(),
      ];
    }
  }
};

module.exports = validate;
