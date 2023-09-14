const router = require("express").Router();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn(
  "/auth/login"
);
const {
  user_profile,
  user_wallet,
  user_orders,
  user_checkout,
  confirmation,
  getBankakInfo,
  filterOrders,
  filterTransactions,
  orderDetails,
  repeatOrder,
} = require("../controllers/user.controller");
const validate = require("../middleware/validator");
const uploadFile = require("../helpers/upload");
const isAuthenticated = require("../middleware/isAuthenticated");

router.all("*", isAuthenticated);

router.get("/profile", user_profile);

router.get("/wallet", user_wallet);
router.get("/orders", user_orders);

router.post("/checkout", validate("gameTopUp"), user_checkout);
router.post("/upload", uploadFile);
router.post(
  "/order/confirmation",
  validate("order"),

  confirmation
);

router.get("/getBankakInfo", getBankakInfo);

router.route("/orders/filter").post(filterOrders).get(user_orders);
router.route("/transactions/filter").post(filterTransactions).get(user_wallet);

router.get("/orders/:orderId/details", orderDetails);

router.get("/orders/:orderId/repeat", repeatOrder);
module.exports = router;
