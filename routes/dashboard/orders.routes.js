const router = require("express").Router();
const Orders = require("../../controllers/dashboard/orders.controller");
const isAuthorized = require("../../middleware/isAuthorized");

// get all orders
const orders = new Orders();
router.get("/", isAuthorized(["supervisor", "admin"]), orders.getAll);

router
.route("/filter")
.post(isAuthorized(["supervisor", "admin"]), orders.filter)
.get(isAuthorized(["supervisor", "admin"]), orders.getAll);

router.get("/sreach", isAuthorized(["supervisor", "admin"]), orders.search);

// get order by id
router.get(
    "/:orderId/details",
    isAuthorized(["supervisor", "admin"]),
    orders.details
);
router.get("/search", isAuthorized(["supervisor", "admin"]), orders.search);
router.get(
    "/:orderId/complated",
    isAuthorized(["supervisor", "admin"]),
    orders.complated
);
router.get(
    "/:orderId/cancelled",
    isAuthorized(["supervisor", "admin"]),
    orders.cancelled
);
// router.get("/:orderId/delete", isAuthorized(["admin"]), orders.delete);
module.exports = router;