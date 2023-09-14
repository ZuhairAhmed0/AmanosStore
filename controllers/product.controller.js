const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const createCookie = require("../helpers/createCookie");
const tryCatch = require("../helpers/tryCatch");
const validationError = require("../helpers/validationError");
const Product = require("../models/Product");
const Review = require("../models/Review");

module.exports = {
  getProductById: tryCatch(async (req, res) => {
    const { productId } = req.params;
    const errors = JSON.parse(req.query.errors || "{}");
    const product = await Product.findOne({_id: productId, deleted: false})
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "fullname",
        },
      })
      .exec();

    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }

    product.reviews.sort((a, b) => b.commentedAt - a.commentedAt);
    res.status(200).render("product-details", {
      title: "تفاصيل المنتج",
      product,
      errors,
      success: req.query.success,
    });
  }),

  addToCart: tryCatch(async (req, res) => {
    const productId = req.body.productId;
    const cart = req.body;
    const product = await Product.findOne({_id: productId, deleted: false});
    let shoppingCart = req.cookies["cart"] || [];

    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }

    const typeOfOperation = req.body["type-of-operation"];

    const error = validationResult(req);

    if (!error.isEmpty()) {
      const { errors } = validationError(error);
      if (typeOfOperation == "direct-purchase") {
        return res.redirect(
          `/products/${req.body.productId}?errors=${JSON.stringify(errors)}`
        );
      }
    }

    shoppingCart = shoppingCart.filter((pro) => pro.productId != product._id);
    cart.price = parseFloat(cart.price);
    cart.totalPrice = parseFloat(cart.price) * parseFloat(cart.count);

    shoppingCart.push(cart);

    createCookie(res, "cart", shoppingCart, 7);
    res.redirect("/cart?success=true");
  }),

  shoppingCart: tryCatch(async (req, res) => {
    res.render("cart", {
      title: "سلة المشتريات",
      errors: JSON.parse(req.query.errors || "{}"),
      success: req.query.success,
    });
  }),

  deleteFromCart: tryCatch(async (req, res) => {
    let shoppingCart = req.cookies["cart"];
    shoppingCart = shoppingCart.filter(
      (pro) => pro.productId !== req.params.id
    );

    createCookie(res, "cart", shoppingCart, 30);
    if (shoppingCart.length == 0) {
      res.clearCookie("cart");
    }
    res.redirect("/cart");
  }),
  updateCart: tryCatch(async (req, res) => {
    let shoppingCart = req.cookies["cart"];

    if (!shoppingCart) {
      return res.redirect("/cart");
    }

    shoppingCart.forEach((product, i) => {
      product.count = req.body.count[i];
      product.totalPrice =
        parseFloat(product.price) * parseFloat(product.count);
      product.price = parseFloat(product.price);
    });
    createCookie(res, "cart", shoppingCart, 30);
    res.redirect("/cart");
  }),
  addReview: tryCatch(async (req, res) => {
    const { productId } = req.params;
    const error = validationResult(req);

    if (!error.isEmpty()) {
      const errors  = validationError(error);
      return res.redirect(
        `/products/${productId}?errors=${JSON.stringify(errors)}`
      );
    }
    const product = await Product.findOne({_id: productId, deleted: false}).populate("reviews");

    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating: req.body.rating,
      comment: req.body.comment,
      commentedAt: Date.now(),
    });

    product.reviews.push(review._id);
    product.save();
    res
      .status(201)
      .redirect(`/products/${productId}?success='شكرا لك تم اضافة مراجعتك'`);
  }),
  deleteReview: tryCatch(async (req, res) => {
    const productId = req.query.productId;
    const reviewId = req.params.productId;
    const product = await Product.updateOne(
      { _id: productId },
      { $pull: { reviews: reviewId } }
    );

    if (!product) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    const reviews = await Review.deleteOne({ _id: reviewId });

    if (!reviews) {
      throw new Error("لم يتم العثور علي المنتج المطلوب");
    }
    return res.redirect(`/products/${productId}`);
  }),
};
