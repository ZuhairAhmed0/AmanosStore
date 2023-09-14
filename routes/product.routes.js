const router = require("express").Router();

const {
  getProductById,
  addToCart,
  shoppingCart,
  deleteFromCart,
  updateCart,
  addReview,
  deleteReview,
} = require("../controllers/product.controller");
const validate = require("../middleware/validator");

router.get("/cart", shoppingCart);
router.post("/cart/:id", validate("gameTopUp"), addToCart);
router.get("/cart/:id", deleteFromCart);

router.get("/products/:productId", getProductById);
router.post("/update-cart", updateCart);

router.route("/prodects/:productId/reviews").post(validate("reivew"), addReview).get(deleteReview);
module.exports = router;