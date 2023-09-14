// import third-party modules
const { validationResult } = require("express-validator");
const moment = require("moment");
const ProductModel = require("../../models/Product");
const CardModel = require("../../models/Card");
const filterData = require("../../helpers/filterData");
const validationError = require("../../helpers/validationError");
const tryCatch = require("../../helpers/tryCatch");
const mongoose = require("mongoose");
class Products {
  constructor() {}

  getAll = tryCatch(async (req, res) => {
    const products = await ProductModel.find().sort({
      createdAt: -1,
    });
    if (!products) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    for (const product of products) {
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

    res.render("dashboard/products", {
      title: "ادارة المنتجات",
      layout: "dashboard",
      products: products,
      today: Date.now(),
      new: req.query.new,
      message: req.query.message,
    });
  });
  add = tryCatch(async (req, res) => {
    const error = validationResult(req);
    const errors = validationError(error);
    if (!error.isEmpty()) {
      return res.render("dashboard/addProduct", {
        title: "اضافة منتج حديد",
        errors,
        values: req.body,
        layout: "dashboard",
      });
    }
    const productInfo = Products.fetchProductData(req);
    productInfo.createdAt = new Date();
    const newProdcut = await ProductModel.create(productInfo);
    if (!newProdcut) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    req.app.locals.imageUploaded = undefined;
    res.render("dashboard/addProduct", {
      title: "اضافة منتج حديد",
      success: "تم اضافة المنتج بنجاح",
      layout: "dashboard",
    });
  });

  edit = tryCatch(async (req, res) => {
    const product = await ProductModel.findById(req.params.id);
    const body = await Products.extractBody(product);
    if (!body) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    res.render("dashboard/addProduct", {
      title: "اضافة منتج حديد",
      values: body,
      layout: "dashboard",
      update: true,
    });
  });
  static fetchProductData = (req) => {
    const { name, title } = req.body;
    const amounts = req.body.amounts?.split(",");
    const prices = req.body.prices?.split(",");
    const totalPrices = req.body.totalPrices?.split(",");
    const quantities = amounts.map((amount, i) => {
      return {
        amount,
        price: parseInt(prices[i]),
        totalPrice: parseInt(totalPrices[i]),
      };
    });
    const productInfo = {
      name,
      image: req.app.locals.imageUploaded || req.body.image,
      title,
      category: req.body.category?.split(",")[0],
      description: req.body.category?.split(",")[1],
      quantities,
    };
    return productInfo;
  };
  static extractBody = async (product) => {
    const body = {};

    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    Object.assign(body, {
      productId: product.id,
      name: product.name,
      imageUploaded: product.image,
      image: product.image,
      category: product.category,
      description: product.description,
      title: product.title,
      amounts: product.quantities.map((q) => q.amount).join(),
      prices: product.quantities.map((q) => q.price).join(),
      totalPrices: product.quantities.map((q) => q.totalPrice).join(),
    });
    return body;
  };

  update = tryCatch(async (req, res) => {
    const error = validationResult(req);
    const errors = validationError(error);
    const productId = req.body.productId;
    if (!error.isEmpty()) {
      return res.render("dashboard/addProduct", {
        title: "اضافة منتج حديد",
        errors,
        values: req.body,
        layout: "dashboard",
        update: true,
      });
    }
    const productInfo = Products.fetchProductData(req);
    const oldProduct = await ProductModel.findById(productId);
    let updatedFields = 0;
    for (let key in productInfo) {
      if (productInfo[key] !== oldProduct[key] && key !== "quantities") {
        oldProduct[key] = productInfo[key];
        updatedFields++;
      }
    }
    for (let key in productInfo.quantities) {
      const quantity = productInfo.quantities[key];
      const pro = oldProduct.quantities[key];
      if (quantity.amount !== pro.amount) {
        oldProduct.quantities[key].amount = quantity.amount;
        updatedFields++;
      } else if (quantity.price !== pro.price) {
        oldProduct.quantities[key].price = quantity.price;
        updatedFields++;
      } else if (quantity.totalPrice !== pro.totalPrice) {
        oldProduct.quantities[key].totalPrice = quantity.totalPrice;
        updatedFields++;
      }
    }

    let success = "لا توجد تغييرات لتعديلها";
    if (updatedFields) {
      oldProduct.save();
      success = "تم تعديل المنتج بنجاح";
    }

    const newData = await Products.extractBody(oldProduct);

    if (!newData) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    res.render("dashboard/addProduct", {
      title: "اضافة منتج حديد",
      success,
      layout: "dashboard",
      values: newData,
      update: true,
    });
  });

  filter = tryCatch(async (req, res) => {
    const date = moment(req.body.dateFilter).startOf("day");
    const products = await filterData(req, ProductModel);
    // render the orders page with orders  filtered
    res.render("dashboard/products", {
      title: "ادارة المنتجات",
      layout: "dashboard",
      products: products,
      today: date,
    });
  });

  details = tryCatch(async (req, res) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    // render the orders page with orders  filtered

    res.render("dashboard/productDetails", {
      title: "تفاصيل المنتج",
      layout: "dashboard",
      product: product,
      success: req.query.success,
    });
  });

  cardDetails = tryCatch(async (req, res) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    // render the orders page with orders  filtered
    // await CardModel.deleteMany({})

    // get the date from user request body
    let {
      createdAt,
      updatedAt,
      status = "",
      amountId = "",
      limit = "",
    } = req.query;
    const date = moment(createdAt || updatedAt).startOf("day");

    // define the query object
    const query = {};

    // add conditions to the query object
    if (createdAt) {
      Object.assign(query, {
        createdAt: {
          $gte: date.toDate(),
          $lte: date.clone().endOf("day").toDate(),
        },
      });
    }
    if (updatedAt) {
      Object.assign(query, {
        updatedAt: {
          $gte: date.toDate(),
          $lte: date.clone().endOf("day").toDate(),
        },
      });
    }
    if (status && status !== "all") {
      Object.assign(query, {
        status,
      });
    }
    if (amountId && amountId !== "all") {
      Object.assign(query, {
        amountId: new mongoose.Types.ObjectId(amountId),
      });
    }

    // check for special cases
    if (limit === "all" || status === "all" || amountId === "all") {
      limit = undefined;
    }

    Object.assign(query, {
      product: product._id,
    });

    // define the pipeline for the aggregation
    const pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $sort: {
          status: -1,
        },
      },
    ];

    // add limit to the pipeline if it exists
    if (limit) {
      pipeline.push({
        $limit: parseInt(limit),
      });
    }
    // execute the aggregation
    let cards = await CardModel.aggregate(pipeline).exec();
    cards = cards.map((card) => {
      return {
        ...card,
        quantities: card.product[0].quantities,
        product: {
          productId: card.product[0]._id,
          name: card.product[0].name,
          amount: card.product[0].quantities.find(
            (q) => q._id.toString() == card.amountId.toString()
          ).amount,
        },
      };
    });
    res.render("dashboard/cardsDetails", {
      title: "تفاصيل البطاقات",
      layout: "dashboard",
      cards,
      success: req.query.success,
    });
  });

  addCard = tryCatch(async (req, res) => {
    const { productId, cardNumbers, amountId, cardId } = req.body;
    const error = validationResult(req);
    const errors = validationError(error);

    if (!error.isEmpty()) {
      return res.render("dashboard/cardTopUp", {
        title: "اضافة بطاقة جديدة حديد",
        errors,
        cardInfo: req.body,
        layout: "dashboard",
      });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }

    if (cardId) {
      const cards = await CardModel.findOne({
        _id: cardId,
        product: product.id,
      });
      if (cards.status == "مباع") {
        res.redirect(
          `/dashboard/products/${product.id}/details?success=لا يمكن تعديل البطاقة بعد البيع`
        );
      } else {
        cards.code = cardNumbers;
        cards.createdAt = new Date();
        cards.save();
        res.redirect(
          `/dashboard/products/${product.id}/details?success=تم تعديل البطاقة بنجاح`
        );
      }
    } else {
      let notAdd = [];
      const newCard = cardNumbers.trim().split(",");
      const Cards = await CardModel.find({ product: product.id });
      const addedCard = [];
      const cards = Cards.map((card) => card.code);

      newCard.forEach((code) => {
        if (cards.includes(code.trim())) {
          notAdd.push(code.trim());
        } else {
          addedCard.push({
            code,
            createdAt: new Date(),
            product: product._id,
            amountId,
          });
        }
      });

      if (notAdd.length) {
        return res.render("dashboard/cardTopUp", {
          title: "اضافة منتج حديد",
          errors: {
            cardNumbers: `تم اضافة  هذه  ${notAdd} البطاقات من قبل`,
          },
          cardInfo: req.body,
          layout: "dashboard",
        });
      } else {
        product.status = "متوفر";
        await CardModel.create(addedCard);
        const availableCards = await CardModel.countDocuments({
          status: "متوفر",
          product: product.id,
          amountId,
        });
        product.quantities.find((q) => q.id == amountId).available =
          availableCards;
        product.save();
        res.redirect(
          `/dashboard/products/${productId}/details?success=تم اضافة البطاقة بنجاح`
        );
      }
    }
  });
  search = tryCatch(async (req, res) => {
    const query = req.query.searchText;
    const searchText = new RegExp(".*" + query + ".*", "i");
    const products = await ProductModel.find({
      deleted: false,
      $or: [
        {
          title: {
            $regex: searchText,
          },
        },
        {
          name: {
            $regex: searchText,
          },
        },
        {
          description: {
            $regex: searchText,
          },
        },
      ],
    });
    // render the orders page with orders  filtered
    res.render("dashboard/products", {
      title: "ادارة المنتجات",
      layout: "dashboard",
      products: products,
      notFound: products.length
        ? `(${products.length}) نتائج بحث المطابقة`
        : `لا توجد نتائج بحث مطابقة (${query})`,
      today: new Date(),
    });
  });
  softDelete = tryCatch(async (req, res) => {
    const productId = req.params.id;
    const product = await ProductModel.findByIdAndUpdate(productId, {
      deleted: true,
    });
    if (!product) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    return res.redirect("/dashboard/products?message=تم حذف المنتج بنجاح");
  });
  hardDelete = tryCatch(async (req, res) => {
    const productId = req.params.id;
    const product = await ProductModel.findByIdAndDelete(productId);
    if (!product) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    return res.redirect("/dashboard/products?message=تم حذف المنتج بشكل نهائي بنجاح");
  });
  restore = tryCatch(async (req, res) => {
    const productId = req.params.id;
    const product = await ProductModel.findByIdAndUpdate(productId, {
      deleted: false,
    });
    if (!product) {
      throw new Error("لم يتم العثور علي الطلب المحدد");
    }
    return res.redirect("/dashboard/products?message=تم استرجاع المنتج بنجاح");
  });
}

module.exports = Products;
